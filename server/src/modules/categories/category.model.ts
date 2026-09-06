import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  /** Display order the merchant chose; the catalogue never sorts alphabetically. */
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export type Category = typeof categories.$inferSelect;
