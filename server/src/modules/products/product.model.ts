import { sql } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";
import { categories } from "../categories/category.model.js";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** Short line used on cards, where the full description will not fit. */
  summary: text("summary").notNull().default(""),
  images: text("images")
    .array()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  // A product without a category is still sellable, so this is nullable and
  // clearing a category must not delete the products filed under it.
  category_id: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  is_published: boolean("is_published").default(true).notNull(),
  ...timestamps,
});

export type Product = typeof products.$inferSelect;
