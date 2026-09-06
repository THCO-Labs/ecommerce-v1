import generatedBrand from "./brand.generated.json";
import siteContent from "./site-content.json";

/**
 * Single place to rename the shop, adjust copy, and change routes.
 * Nothing below is derived from the database, so an AI builder can rebrand the
 * app by editing this one file.
 */

export const appConfig = {
  name: generatedBrand.name,
  /** Rendered as two words so the second can carry the brand colour. */
  nameParts: generatedBrand.nameParts,
  description: generatedBrand.description,
  tagline: generatedBrand.tagline,
  url: generatedBrand.url,
  logoPath: generatedBrand.logoPath as string | null,
  /** Which token set the app opens in, chosen at build time. */
  defaultTheme: ((generatedBrand as { theme?: string }).theme === "dark" ? "dark" : "light") as "light" | "dark",
  locale: "en-GB",
  currency: "GBP",
  /** Cash on delivery: nothing is charged online, ever. */
  paymentOnDelivery: true,
  freeDeliveryOver: 50,
  deliveryFee: 4.99,
  /** A SKU at or below this is shown as running out. */
  lowStockThreshold: 5,
} as const;

/**
 * Chrome that renders on every page: header, footer, dashboard sidebar.
 *
 * It lives in JSON rather than in the components because those components are
 * shared. A component shared by nine pages cannot sit inside any one page's
 * edit boundary without an edit aimed at one page silently rewriting the other
 * eight — so the copy lives here, edited deterministically, while the
 * components get page entries of their own for styling.
 */
export const siteChrome = siteContent;

export interface NavLink {
  label: string;
  href: string;
}

export const routes = {
  home: "/",
  products: "/products",
  product: (slug: string) => `/products/${slug}`,
  category: (slug: string) => `/products?category=${encodeURIComponent(slug)}`,
  cart: "/cart",
  checkout: "/checkout",
  confirmation: (reference: string) => `/orders/confirmation/${reference}`,
  lookup: "/orders/lookup",
  auth: {
    login: "/login",
    register: "/register",
    forbidden: "/forbidden",
  },
  account: {
    root: "/account",
  },
  dashboard: {
    root: "/dashboard",
    orders: "/dashboard/orders",
    inventory: "/dashboard/inventory",
    products: "/dashboard/products",
    users: "/dashboard/users",
    settings: "/dashboard/settings",
  },
} as const;

/** Guest-facing links in the storefront header, read from site-content.json. */
export const guestNavItems: NavLink[] = siteContent.header.nav;

/** Order statuses in the order they actually happen, for pickers and timelines. */
export const orderStatusFlow = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
] as const;
