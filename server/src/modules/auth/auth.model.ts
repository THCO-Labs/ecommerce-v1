import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";

/**
 * Three roles, genuinely distinct.
 *
 * `staff` fulfil orders and restock; only `admin` may create products, change
 * prices, or manage users. The split is enforced by `requireRole` on each
 * route, never by the client.
 */
export const userRole = pgEnum("user_role", ["customer", "staff", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash"),
  full_name: text("full_name"),
  phone: text("phone"),
  role: userRole("role").default("customer").notNull(),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type UserRole = User["role"];
