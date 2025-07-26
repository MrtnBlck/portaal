// t model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTableCreator,
  timestamp,
  varchar,
  boolean,
  text,
  unique,
} from "drizzle-orm/pg-core";

/**
 * This is an t of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `portaal_${name}`);

export const projects = createTable(
  "project",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    ownerId: varchar("owner_id", { length: 256 }).notNull(),
    data: json("data").default({}).notNull(),
    templateId: integer("template_id").notNull(),
    templateOwnerId: varchar("template_owner_id", { length: 256 }).notNull(),
    isTemplateEditable: boolean("is_editable").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [index("projectName_idx").on(t.name)],
);

export const templates = createTable(
  "template",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 256 }).notNull().default("Untitled"),
    ownerId: varchar("owner_id", { length: 256 }).notNull(),
    data: json("data").notNull().default({
      frames: [],
      links: [],
    }),
    description: text("description"),
    isEditable: boolean("is_editable").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    previewImageURL: text("preview_image_url"),
    filterIds: json("filter_ids").default({ filterIds: [] }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [index("templateName_idx").on(t.name)],
);

export const sharedProjects = createTable("shared_project", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const filters = createTable("filter", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => filterCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  common: boolean("common").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const filtersRelations = relations(filters, ({ one }) => ({
  filter: one(filterCategories, {
    fields: [filters.categoryId],
    references: [filterCategories.id],
  }),
}));

export const filterCategories = createTable(
  "filter_category",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => [unique().on(t.name)],
);

export const filterCategoriesRelations = relations(
  filterCategories,
  ({ many }) => ({
    filters: many(filters),
  }),
);
