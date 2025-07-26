import "server-only";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import { db } from "../db";
import { projects, sharedProjects, templates } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authGuard } from "./auth-guard";
import { HTTPException } from "hono/http-exception";
import { EditorDataSchema } from "./zod";
import { eq } from "drizzle-orm";

export const app = new Hono()
  .basePath("/api")
  .use("*", clerkMiddleware())
  //projects
  .get("/projects", authGuard(), async (c) => {
    const user = c.var.user;
    const projects = await db.query.projects.findMany({
      where: (project, { eq }) => eq(project.ownerId, user.userId),
      columns: {
        id: true,
        name: true,
      },
    });

    return c.json({ projects });
  })
  .get(
    "/projects/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;

      const project = await db.query.projects.findFirst({
        where: (project, { eq }) => eq(project.id, id),
        columns: {
          id: true,
          name: true,
          data: true,
          ownerId: true,
          templateOwnerId: true,
          isTemplateEditable: true,
        },
      });

      if (!project) {
        throw new HTTPException(404);
      }

      if (project.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      return c.json({ project });
    },
  )
  .post(
    "/projects",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        templateId: z.number(),
        templateOwnerId: z.string(),
        data: EditorDataSchema,
        isTemplateEditable: z.boolean(),
      }),
    ),
    authGuard(),
    async (c) => {
      const user = c.var.user;

      const [insertedProject] = await db
        .insert(projects)
        .values({
          name: c.req.valid("json").name,
          ownerId: user.userId,
          data: c.req.valid("json").data,
          templateId: c.req.valid("json").templateId,
          templateOwnerId: c.req.valid("json").templateOwnerId,
          isTemplateEditable: c.req.valid("json").isTemplateEditable,
        })
        .returning({ id: projects.id });

      if (!insertedProject) {
        return c.json({ error: "Failed to create project" }, 500);
      }

      return c.json({ id: insertedProject.id }, 201);
    },
  )
  .patch(
    "/projects/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    zValidator(
      "json",
      z.object({
        name: z.string().optional(),
        data: EditorDataSchema.optional(),
      }),
    ),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;
      const json = c.req.valid("json");
      const project = await db.query.projects.findFirst({
        where: (project, { eq }) => eq(project.id, id),
      });

      if (!project) {
        throw new HTTPException(404);
      }

      if (project.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      const [patchedProject] = await db
        .update(projects)
        .set({ name: json.name, data: json.data })
        .where(eq(projects.id, id))
        .returning({ id: projects.id });

      if (!patchedProject) {
        return c.json({ error: "Failed to update project" }, 500);
      }

      return c.json({ id: patchedProject.id }, 200);
    },
  )
  // TODO: delete included images
  .delete(
    "/projects/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;

      const project = await db.query.projects.findFirst({
        where: (project, { eq }) => eq(project.id, id),
      });

      if (!project) {
        throw new HTTPException(404);
      }

      if (project.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      await db.delete(projects).where(eq(projects.id, id));

      return c.json({ success: true });
    },
  )
  //shared projects
  .post(
    "/sharedProjects",
    zValidator(
      "json",
      z.object({
        projectId: z.number().int(),
        userId: z.string(),
      }),
    ),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const json = c.req.valid("json");

      const project = await db.query.projects.findFirst({
        columns: {
          id: true,
          ownerId: true,
        },
        where: (project, { eq }) => eq(project.id, json.projectId),
      });

      if (!project) {
        throw new HTTPException(404);
      }

      if (project.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      const existingShare = await db.query.sharedProjects.findFirst({
        where: (sharedProject, { and, eq }) =>
          and(
            eq(sharedProject.projectId, json.projectId),
            eq(sharedProject.userId, json.userId),
          ),
      });

      if (existingShare) {
        return c.json({ error: "Project already shared with this user" }, 400);
      }

      const [insertedSharedProject] = await db
        .insert(sharedProjects)
        .values({
          projectId: json.projectId,
          userId: json.userId,
        })
        .returning({ id: sharedProjects.id });

      if (!insertedSharedProject) {
        return c.json({ error: "Failed to share project" }, 500);
      }

      return c.json({ id: insertedSharedProject.id }, 201);
    },
  )
  //templates
  .get("/publicTemplates", authGuard(), async (c) => {
    const templates = await db.query.templates.findMany({
      columns: {
        id: true,
        name: true,
        isEditable: true,
        filterIds: true,
        previewImageURL: true,
      },
      where: (template, { eq }) => eq(template.isPublic, true),
      orderBy: (template, { asc }) => asc(template.id),
    });
    return c.json({ templates });
  })
  .get("/templates", authGuard(), async (c) => {
    const user = c.var.user;
    const templates = await db.query.templates.findMany({
      where: (template, { eq }) => eq(template.ownerId, user.userId),
      columns: {
        id: true,
        name: true,
        isEditable: true,
        isPublic: true,
        data: true,
        filterIds: true,
      },
    });
    return c.json({ templates });
  })
  .get(
    "/publicTemplate/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    authGuard(),
    async (c) => {
      const id = c.req.valid("param").id;

      const template = await db.query.templates.findFirst({
        where: (template, { eq }) => eq(template.id, id),
        columns: {
          data: true,
          ownerId: true,
          isPublic: true,
          filterIds: true,
          isEditable: true,
        },
      });

      if (!template) {
        throw new HTTPException(404);
      }

      if (!template.isPublic) {
        throw new HTTPException(403);
      }

      return c.json({ template });
    },
  )
  .get(
    "/templates/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;

      const template = await db.query.templates.findFirst({
        where: (template, { eq }) => eq(template.id, id),
        columns: {
          id: true,
          data: true,
          ownerId: true,
          name: true,
          filterIds: true,
        },
      });

      if (!template) {
        throw new HTTPException(404);
      }

      if (template.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      return c.json({ template });
    },
  )
  .post(
    "/templates",
    zValidator(
      "json",
      z.object({
        name: z.string().optional(),
        data: EditorDataSchema.optional(),
        isEditable: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        filterIds: z.object({ filterIds: z.array(z.number()) }).optional(),
      }),
    ),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const json = c.req.valid("json");

      const [insertedTemplate] = await db
        .insert(templates)
        .values({
          name: json.name,
          ownerId: user.userId,
          data: json.data,
          isEditable: json.isEditable,
          isPublic: json.isPublic,
          filterIds: json.filterIds,
        })
        .returning({ id: templates.id });

      if (!insertedTemplate) {
        return c.json({ error: "Failed to create template" }, 500);
      }

      return c.json({ id: insertedTemplate.id }, 201);
    },
  )
  .patch(
    "/templates/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    zValidator(
      "json",
      z.object({
        name: z.string().optional(),
        data: EditorDataSchema.optional(),
        isEditable: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        filterIds: z.object({ filterIds: z.array(z.number()) }).optional(),
      }),
    ),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;
      const json = c.req.valid("json");

      const template = await db.query.templates.findFirst({
        where: (template, { eq }) => eq(template.id, id),
      });

      if (!template) {
        throw new HTTPException(404);
      }

      if (template.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      const [patchedTemplate] = await db
        .update(templates)
        .set({
          name: json.name,
          data: json.data,
          isEditable: json.isEditable,
          isPublic: json.isPublic,
          filterIds: json.filterIds,
        })
        .where(eq(templates.id, id))
        .returning({ id: templates.id });

      if (!patchedTemplate) {
        return c.json({ error: "Failed to update template" }, 500);
      }

      return c.json({ id: patchedTemplate.id }, 200);
    },
  )
  .delete(
    "/templates/:id",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    authGuard(),
    async (c) => {
      const user = c.var.user;
      const id = c.req.valid("param").id;

      const template = await db.query.templates.findFirst({
        where: (template, { eq }) => eq(template.id, id),
      });

      if (!template) {
        throw new HTTPException(404);
      }

      if (template.ownerId !== user.userId) {
        throw new HTTPException(403);
      }

      await db.delete(templates).where(eq(templates.id, id));

      return c.json({ success: true });
    },
  )
  //filters
  .get("allFilters", authGuard(), async (c) => {
    const filters = await db.query.filters.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        common: true,
        categoryId: true,
      },
    });
    return c.json({ filters });
  })
  .get("/filters", authGuard(), async (c) => {
    const filterGroups = await db.query.filterCategories.findMany({
      columns: { id: true, name: true },
      with: {
        filters: {
          columns: { id: true, name: true, description: true, common: true },
        },
      },
    });
    return c.json({ filterGroups });
  });

export type AppType = typeof app;
