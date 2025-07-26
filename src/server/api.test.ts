import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./db/schema";
import { app } from "./api/router";
import { testClient } from "hono/testing";
import { Context, Hono, Next } from "hono";
const { generateDrizzleJson, generateMigration } =
  require("drizzle-kit/api") as typeof import("drizzle-kit/api");
import { db } from "./db/index";

vi.mock("server-only", () => ({}));

vi.mock("@hono/clerk-auth", () => ({
  clerkMiddleware: () => (_: any, next: any) => next(),
}));
vi.mock("./api/auth-guard", () => ({
  authGuard: () => (_: any, next: any) => next(),
}));

vi.mock("./db/index", () => ({
  db: drizzle(new PGlite(), { schema }),
}));

const MOCK_USER_ID = crypto.randomUUID();

const migrations = await generateMigration(
  generateDrizzleJson({}),
  generateDrizzleJson(schema),
);

describe("API tests", () => {
  const userMiddlewareMock = vi.fn((c: Context, next: Next) => {
    c.set("user", { userId: MOCK_USER_ID });
    return next();
  });
  const testApp = testClient(
    new Hono().use("*", userMiddlewareMock).route("/", app),
  );

  beforeEach(async () => {
    await db.execute("DROP SCHEMA IF EXISTS public CASCADE");
    await db.execute("CREATE SCHEMA public");
    for (const migration of migrations) {
      await db.execute(migration);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Get own projects", () => {
    test("Fetches user's projects", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: MOCK_USER_ID,
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
          {
            name: "Test Project 2",
            data: {},
            ownerId: crypto.randomUUID(),
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects.$get();

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        projects: [{ id: project!.id, name: "Test Project" }],
      });
    });
  });

  describe("Get project by id", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.projects[":id"].$get({
        param: { id: "invalid-id" },
      });

      expect(result.status).toBe(400);
    });

    test("Throws 404 if project not found", async () => {
      const result = await testApp.api.projects[":id"].$get({
        param: { id: "1" },
      });

      expect(result.status).toBe(404);
    });

    test("Throws 403 if user is not the project's owner", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: crypto.randomUUID(),
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$get({
        param: { id: `${project?.id}` },
      });

      expect(result.status).toBe(403);
    });

    test("Fetches project by id", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const projectData = {
        name: "Test Project",
        data: {},
        ownerId: MOCK_USER_ID,
        templateId: template!.id,
        templateOwnerId: MOCK_USER_ID,
        isTemplateEditable: false,
      };
      const [project] = await db
        .insert(schema.projects)
        .values(projectData)
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$get({
        param: { id: `${project?.id}` },
      });

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        project: {
          id: project?.id,
          name: projectData.name,
          data: projectData.data,
          ownerId: projectData.ownerId,
          templateOwnerId: projectData.templateOwnerId,
          isTemplateEditable: projectData.isTemplateEditable,
        },
      });
    });
  });

  describe("Create project", () => {
    test("Throws 400 if called with invalid data", async () => {
      const result = await testApp.api.projects.$post({
        // @ts-expect-error
        json: { invalid: "data" },
      });

      expect(result.status).toBe(400);
    });

    test("Inserts new project into the database", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const result = await testApp.api.projects.$post({
        json: {
          name: "Test Project",
          data: { frames: [], links: [] },
          templateId: template!.id,
          templateOwnerId: MOCK_USER_ID,
        },
      });

      expect(result.status).toBe(201);
      const data = await result.json();
      expect(data).toEqual({ id: expect.any(Number) });

      if (!("id" in data)) {
        expect.fail("id not found in response");
      }

      await expect(
        db.query.projects.findFirst({
          where: (projects, { eq }) => eq(projects.id, data.id),
        }),
      ).resolves.toBeDefined();
    });
  });

  describe("Update project", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.projects[":id"].$patch({
        param: { id: "invalid-id" },
        json: {},
      });

      expect(result.status).toBe(400);
    });

    test("Throws 400 if called with invalid data", async () => {
      const result = await testApp.api.projects[":id"].$patch({
        param: { id: "1" },
        // @ts-expect-error
        json: { name: 123 },
      });

      expect(result.status).toBe(400);
    });

    test("Throws 404 if project not found", async () => {
      const result = await testApp.api.projects[":id"].$patch({
        param: { id: "1" },
        json: { name: "Updated Project" },
      });

      expect(result.status).toBe(404);
    });

    test("Throws 403 if user is not the project's owner", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: crypto.randomUUID(),
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$patch({
        param: { id: `${project?.id}` },
        json: { name: "Updated Project" },
      });

      expect(result.status).toBe(403);
    });

    test("Updates project in the database", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: MOCK_USER_ID,
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$patch({
        param: { id: `${project?.id}` },
        json: { name: "Updated Project" },
      });

      expect(result.status).toBe(200);
      const body = await result.json();

      if (!("id" in body)) {
        expect.fail("id not found in response");
      }

      expect(body).toEqual({ id: project?.id });
      await expect(
        db.query.projects.findFirst({
          where: (projects, { eq }) => eq(projects.id, project!.id),
          columns: { name: true },
        }),
      ).resolves.toEqual({ name: "Updated Project" });
    });
  });

  describe("Delete project", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.projects[":id"].$delete({
        param: { id: "invalid-id" },
      });

      expect(result.status).toBe(400);
    });

    test("Throws 404 if project not found", async () => {
      const result = await testApp.api.projects[":id"].$delete({
        param: { id: "1" },
      });

      expect(result.status).toBe(404);
    });

    test("Throws 403 if user is not the project's owner", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: crypto.randomUUID(),
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$delete({
        param: { id: `${project?.id}` },
      });

      expect(result.status).toBe(403);
    });

    test("Deletes project from the database", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({ ownerId: MOCK_USER_ID, isEditable: true, isPublic: false })
        .returning({ id: schema.templates.id });
      const [project] = await db
        .insert(schema.projects)
        .values([
          {
            name: "Test Project",
            data: {},
            ownerId: MOCK_USER_ID,
            templateId: template!.id,
            templateOwnerId: MOCK_USER_ID,
            isTemplateEditable: false,
          },
        ])
        .returning({ id: schema.projects.id });

      const result = await testApp.api.projects[":id"].$delete({
        param: { id: `${project?.id}` },
      });

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({ success: true });
      await expect(
        db.query.projects.findFirst({
          where: (projects, { eq }) => eq(projects.id, project!.id),
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("Get public templates", () => {
    test("Fetches ordered public templates", async () => {
      const [templateB, _, templateA] = await db
        .insert(schema.templates)
        .values([
          {
            name: "Test Template B",
            data: {},
            ownerId: MOCK_USER_ID,
            isEditable: true,
            isPublic: true,
          },
          {
            name: "Test Template 2",
            data: {},
            ownerId: crypto.randomUUID(),
            isEditable: true,
            isPublic: false,
          },
          {
            name: "Test Template A",
            data: {},
            ownerId: MOCK_USER_ID,
            isEditable: true,
            isPublic: true,
          },
        ])
        .returning({
          id: schema.templates.id,
          name: schema.templates.name,
          isEditable: schema.templates.isEditable,
          ownerId: schema.templates.ownerId,
          isPublic: schema.templates.isPublic,
          filterIds: schema.templates.filterIds,
        });

      const result = await testApp.api.publicTemplates.$get();

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        templates: [templateB, templateA],
      });
    });
  });

  describe("Get own templates", () => {
    test("Fetches user's templates", async () => {
      const [template, , template2] = await db
        .insert(schema.templates)
        .values([
          {
            name: "Test Template",
            data: {},
            ownerId: MOCK_USER_ID,
            isEditable: true,
            isPublic: false,
          },
          {
            name: "Test Template 2",
            data: {},
            ownerId: crypto.randomUUID(),
            isEditable: true,
            isPublic: false,
          },
          {
            name: "Test Template 3",
            data: {},
            ownerId: MOCK_USER_ID,
            isEditable: true,
            isPublic: true,
          },
        ])
        .returning({
          id: schema.templates.id,
          name: schema.templates.name,
          isEditable: schema.templates.isEditable,
          isPublic: schema.templates.isPublic,
          data: schema.templates.data,
          filterIds: schema.templates.filterIds,
        });

      const result = await testApp.api.templates.$get();

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        templates: [template, template2],
      });
    });
  });

  describe("Get public template by id", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.publicTemplate[":id"].$get({
        param: { id: "invalid-id" },
      });
      expect(result.status).toBe(400);
    });

    test("Throws 404 if template not found", async () => {
      const result = await testApp.api.publicTemplate[":id"].$get({
        param: { id: "1" },
      });
      expect(result.status).toBe(404);
    });

    test("Throws 403 if template is not public", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({
          name: "Test Template",
          data: {},
          ownerId: MOCK_USER_ID,
          isEditable: true,
          isPublic: false,
        })
        .returning({ id: schema.templates.id });

      const result = await testApp.api.publicTemplate[":id"].$get({
        param: { id: `${template?.id}` },
      });

      expect(result.status).toBe(403);
    });

    test("Fetches public template by id", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({
          name: "Test Template",
          data: {},
          ownerId: MOCK_USER_ID,
          isEditable: true,
          isPublic: true,
        })
        .returning({
          id: schema.templates.id,
          data: schema.templates.data,
          ownerId: schema.templates.ownerId,
          isPublic: schema.templates.isPublic,
          filterIds: schema.templates.filterIds,
        });

      const result = await testApp.api.publicTemplate[":id"].$get({
        param: { id: `${template?.id}` },
      });

      expect(result.status).toBe(200);
      const { id: _, ...templateData } = template!;
      await expect(result.json()).resolves.toEqual({
        template: templateData,
      });
    });
  });

  describe("Get template by id", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.templates[":id"].$get({
        param: { id: "invalid-id" },
      });
      expect(result.status).toBe(400);
    });

    test("Throws 404 if template not found", async () => {
      const result = await testApp.api.templates[":id"].$get({
        param: { id: "1" },
      });
      expect(result.status).toBe(404);
    });

    test("Fetches template by id", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({
          name: "Test Template",
          data: {},
          ownerId: MOCK_USER_ID,
          isEditable: true,
          isPublic: false,
        })
        .returning({
          id: schema.templates.id,
          data: schema.templates.data,
          ownerId: schema.templates.ownerId,
          name: schema.templates.name,
          filterIds: schema.templates.filterIds,
        });

      const result = await testApp.api.templates[":id"].$get({
        param: { id: `${template?.id}` },
      });

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        template,
      });
    });
  });

  describe("Create template", () => {
    test("Throws 400 if called with invalid data", async () => {
      const result = await testApp.api.templates.$post({
        // @ts-expect-error
        json: { name: 123 },
      });

      expect(result.status).toBe(400);
    });

    test("Inserts new template into the database", async () => {
      const result = await testApp.api.templates.$post({
        json: {
          name: "Test Template",
          data: { frames: [], links: [] },
          isEditable: true,
          isPublic: false,
        },
      });

      expect(result.status).toBe(201);
      const data = await result.json();
      expect(data).toEqual({ id: expect.any(Number) });

      if (!("id" in data)) {
        expect.fail("id not found in response");
      }

      await expect(
        db.query.templates.findFirst({
          where: (templates, { eq }) => eq(templates.id, data.id),
        }),
      ).resolves.toBeDefined();
    });
  });

  describe("Update template", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.templates[":id"].$patch({
        param: { id: "invalid-id" },
        json: {},
      });

      expect(result.status).toBe(400);
    });

    test("Throws 400 if called with invalid data", async () => {
      const result = await testApp.api.templates[":id"].$patch({
        param: { id: "1" },
        // @ts-expect-error
        json: { name: 123 },
      });

      expect(result.status).toBe(400);
    });

    test("Throws 404 if template not found", async () => {
      const result = await testApp.api.templates[":id"].$patch({
        param: { id: "1" },
        json: { name: "Updated Template" },
      });

      expect(result.status).toBe(404);
    });

    test("Fetches template by id", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({
          name: "Test Template",
          data: {},
          ownerId: MOCK_USER_ID,
          isEditable: true,
          isPublic: false,
        })
        .returning({ id: schema.templates.id });

      const result = await testApp.api.templates[":id"].$patch({
        param: { id: `${template?.id}` },
        json: { name: "Updated Template" },
      });

      expect(result.status).toBe(200);
      const body = await result.json();

      if (!("id" in body)) {
        expect.fail("id not found in response");
      }

      expect(body).toEqual({ id: template?.id });
      await expect(
        db.query.templates.findFirst({
          where: (templates, { eq }) => eq(templates.id, template!.id),
          columns: { name: true },
        }),
      ).resolves.toEqual({ name: "Updated Template" });
    });
  });

  describe("Delete template", () => {
    test("Throws 400 if id is not a number", async () => {
      const result = await testApp.api.templates[":id"].$delete({
        param: { id: "invalid-id" },
      });

      expect(result.status).toBe(400);
    });

    test("Throws 404 if template not found", async () => {
      const result = await testApp.api.templates[":id"].$delete({
        param: { id: "1" },
      });

      expect(result.status).toBe(404);
    });

    test("Deletes template from the database", async () => {
      const [template] = await db
        .insert(schema.templates)
        .values({
          name: "Test Template",
          data: {},
          ownerId: MOCK_USER_ID,
          isEditable: true,
          isPublic: false,
        })
        .returning({ id: schema.templates.id });

      const result = await testApp.api.templates[":id"].$delete({
        param: { id: `${template?.id}` },
      });

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({ success: true });
      await expect(
        db.query.templates.findFirst({
          where: (templates, { eq }) => eq(templates.id, template!.id),
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("Get all filters", () => {
    test("Fetches all filters", async () => {
      const [category] = await db
        .insert(schema.filterCategories)
        .values({
          name: "Test Category",
        })
        .returning({ id: schema.filterCategories.id });
      const [filterA, filterB] = await db
        .insert(schema.filters)
        .values([
          {
            name: "Test Filter A",
            description: "Description A",
            categoryId: category!.id,
          },
          {
            name: "Test Filter B",
            description: "Description B",
            categoryId: category!.id,
          },
        ])
        .returning({
          id: schema.filters.id,
          name: schema.filters.name,
          description: schema.filters.description,
          common: schema.filters.common,
          categoryId: schema.filters.categoryId,
        });

      const result = await testApp.api.allFilters.$get();

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        filters: [filterA, filterB],
      });
    });
  });

  describe("Get filters by category", () => {
    test("Fetches filters by category", async () => {
      const [categoryA, categoryB] = await db
        .insert(schema.filterCategories)
        .values([{ name: "Test Category A" }, { name: "Test Category B" }])
        .returning({
          id: schema.filterCategories.id,
          name: schema.filterCategories.name,
        });
      const [filterA, filterB, filterC] = await db
        .insert(schema.filters)
        .values([
          {
            name: "Test Filter A",
            description: "Description A",
            categoryId: categoryA!.id,
          },
          {
            name: "Test Filter B",
            description: "Description B",
            categoryId: categoryA!.id,
          },
          {
            name: "Test Filter C",
            description: "Description C",
            categoryId: categoryB!.id,
          },
        ])
        .returning({
          id: schema.filters.id,
          name: schema.filters.name,
          description: schema.filters.description,
          common: schema.filters.common,
        });

      const result = await testApp.api.filters.$get();

      expect(result.status).toBe(200);
      await expect(result.json()).resolves.toEqual({
        filterGroups: [
          {
            ...categoryA,
            filters: [filterA, filterB],
          },
          {
            ...categoryB,
            filters: [filterC],
          },
        ],
      });
    });
  });
});
