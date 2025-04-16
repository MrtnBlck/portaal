// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTableCreator,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `portaal_${name}`);

export const projects = createTable(
  "project",
  {
    id: integer("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    ownerId: varchar("owner_id", { length: 256 }).notNull(),
    data: json("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => [index("projectName_idx").on(example.name)],
);

export const templates = createTable(
  "template",
  {
    id: integer("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    ownerId: varchar("owner_id", { length: 256 }).notNull(),
    data: json("data").notNull(),
    description: varchar("description", { length: 256 }).notNull(),
    isEditable: boolean("is_editable").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => [index("templateName_idx").on(example.name)],
);

export const images = createTable("image", {
  id: integer("id").primaryKey(),
  url: varchar("url", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
