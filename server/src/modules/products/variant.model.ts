import { boolean, integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";
import { products } from "./product.model.js";

/**
 * A buyable SKU. Price and stock live here rather than on the product, because
 * a large tee and a small tee are different money and different inventory.
 * A product with one variant is the ordinary case, not a special case.
 */
export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  sku: text("sku").notNull().unique(),
  /** What distinguishes it from its siblings — "Large", "500ml", "Walnut". */
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  /** Units on hand. Decremented at checkout; never held by a cart. */
  stock: integer("stock").notNull().default(0),
  is_active: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export type Variant = typeof variants.$inferSelect;
