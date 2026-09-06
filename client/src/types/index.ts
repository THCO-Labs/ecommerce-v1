/**
 * Domain types.
 *
 * The client never imports the Drizzle schema, so these mirror the JSON the API
 * returns: `timestamptz` columns arrive as ISO strings and `numeric` columns as
 * numbers, because the server declares them with `mode: "number"`.
 */

export type UserRole = "customer" | "staff" | "admin";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

/** The signed-in user, as returned by `/api/auth/me`. */
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  images: string[];
  category_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** What a product card needs, and nothing more. */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string | null;
  /** Cheapest active variant — what "from" means on a card. */
  priceFrom: number;
  inStock: boolean;
  categoryName: string | null;
}

export type ProductWithVariants = Product & {
  variants: Variant[];
  categoryName: string | null;
};

export type AdminProduct = Product & {
  categoryName: string | null;
  variantCount: number;
  totalStock: number;
};

export type InventoryRow = Variant & {
  productTitle: string;
  productSlug: string;
};

export interface CartLine {
  id: string;
  variantId: string;
  productSlug: string;
  productTitle: string;
  variantName: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  isActive: boolean;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** True when a line exceeds stock; checkout refuses until it is fixed. */
  hasShortfall: boolean;
}

export interface Order {
  id: string;
  reference: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Snapshots taken at checkout — never re-joined to the live catalogue. */
export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_title: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
}

/** The redacted view a confirmation page can show from a reference alone. */
export interface OrderSummary {
  reference: string;
  status: OrderStatus;
  city: string;
  country: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  placedAt: string;
  items: Array<{
    productTitle: string;
    variantName: string;
    quantity: number;
    lineTotal: number;
  }>;
}

export interface DashboardMetrics {
  orders_today: number;
  pending_fulfilment: number;
  revenue_this_month: number;
  low_stock_count: number;
}
