import { integer, numeric, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";
import { users } from "../auth/auth.model.js";
import { variants } from "../products/variant.model.js";

export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").notNull().unique(),
  // Null for a guest checkout, and cleared rather than cascaded when an account
  // is deleted: the order is a record of something that happened.
  user_id: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  customer_name: text("customer_name").notNull(),
  customer_email: text("customer_email").notNull(),
  customer_phone: text("customer_phone").notNull(),

  address_line1: text("address_line1").notNull(),
  address_line2: text("address_line2"),
  city: text("city").notNull(),
  region: text("region").notNull().default(""),
  postal_code: text("postal_code").notNull().default(""),
  country: text("country").notNull(),

  status: orderStatus("status").default("PENDING").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2, mode: "number" }).notNull(),
  delivery_fee: numeric("delivery_fee", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
  total: numeric("total", { precision: 12, scale: 2, mode: "number" }).notNull(),
  /** Cash on delivery only in this template; nothing is charged online. */
  payment_method: text("payment_method").notNull().default("COD"),
  notes: text("notes"),
  ...timestamps,
});

/**
 * Order lines snapshot what was bought.
 *
 * `product_title`, `variant_name` and `unit_price` are copied at checkout and
 * never joined back to the catalogue for display. Renaming a product or
 * changing its price afterwards must not rewrite what a customer was charged,
 * and deleting a SKU must not erase the line — hence the nullable reference.
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variant_id: uuid("variant_id").references(() => variants.id, { onDelete: "set null" }),
  product_title: text("product_title").notNull(),
  variant_name: text("variant_name").notNull(),
  unit_price: numeric("unit_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  quantity: integer("quantity").notNull(),
  line_total: numeric("line_total", { precision: 12, scale: 2, mode: "number" }).notNull(),
  ...timestamps,
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderStatus = Order["status"];
