import { relations } from "drizzle-orm";
import { users } from "../../modules/auth/auth.model.js";
import { categories } from "../../modules/categories/category.model.js";
import { products } from "../../modules/products/product.model.js";
import { variants } from "../../modules/products/variant.model.js";
import { carts, cartItems } from "../../modules/cart/cart.model.js";
import { orders, orderItems } from "../../modules/orders/order.model.js";

/**
 * Relations live outside the module models so each model file stays a leaf: a
 * product knows nothing about carts, but the graph is still declared once.
 */
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.category_id], references: [categories.id] }),
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, { fields: [variants.product_id], references: [products.id] }),
  cartItems: many(cartItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.user_id], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cart_id], references: [carts.id] }),
  variant: one(variants, { fields: [cartItems.variant_id], references: [variants.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.user_id], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.order_id], references: [orders.id] }),
  variant: one(variants, { fields: [orderItems.variant_id], references: [variants.id] }),
}));
