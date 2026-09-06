import { integer, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../../common/db/columns.js";
import { users } from "../auth/auth.model.js";
import { variants } from "../products/variant.model.js";

/**
 * A server-side cart.
 *
 * Anonymous shoppers get a cart keyed by a signed cookie token; signing in
 * merges that cart into the account's. Keeping the cart on the server rather
 * than in localStorage is what lets the header badge, the cart page and
 * checkout all read it without sharing a client module between them.
 */
export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Null while the shopper is anonymous. Deleting an account takes its cart.
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  /** Opaque token stored in the cart cookie; how a guest cart is found again. */
  session_token: uuid("session_token").defaultRandom().notNull().unique(),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  ...timestamps,
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cart_id: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    // A variant that is deleted disappears from every cart holding it; a cart
    // line has no meaning without the SKU it points at.
    variant_id: uuid("variant_id")
      .references(() => variants.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull().default(1),
    ...timestamps,
  },
  // One row per SKU per cart, so adding an item already present increments it
  // rather than producing two lines the customer has to reconcile.
  (table) => [unique("cart_items_cart_variant_unique").on(table.cart_id, table.variant_id)],
);

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
