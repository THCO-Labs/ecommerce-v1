/**
 * Schema barrel. Every module owns its own table definition; this file is the
 * single entry point drizzle-kit and the query client read.
 */
export { users, userRole, type User, type UserRole } from "../../modules/auth/auth.model.js";
export { categories, type Category } from "../../modules/categories/category.model.js";
export { products, type Product } from "../../modules/products/product.model.js";
export { variants, type Variant } from "../../modules/products/variant.model.js";
export { carts, cartItems, type Cart, type CartItem } from "../../modules/cart/cart.model.js";
export {
  orders,
  orderItems,
  orderStatus,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "../../modules/orders/order.model.js";
export * from "./relations.js";
