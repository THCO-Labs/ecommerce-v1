import { timestamp } from "drizzle-orm/pg-core";

/** Every table carries the same audit columns. */
export const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};
