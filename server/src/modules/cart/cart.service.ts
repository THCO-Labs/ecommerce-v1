import type { CookieOptions, Request, Response } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../../common/db/index.js";
import { badRequest, conflict, notFound } from "../../common/errors.js";
import { isProduction } from "../../common/env.js";
import { lineTotal, sum } from "../../common/money.js";
import { carts, cartItems } from "./cart.model.js";
import { variants } from "../products/variant.model.js";
import { products } from "../products/product.model.js";

export const CART_COOKIE_NAME = "northwind_cart";
const CART_COOKIE_MAX_AGE_MS = 60 * 60 * 24 * 30 * 1000;
/** A guard against a fat finger or a script, not an inventory rule. */
const MAX_LINE_QUANTITY = 99;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
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
  /** What is actually on hand, so the cart can warn before checkout does. */
  stock: number;
  isActive: boolean;
}

export interface CartView {
  id: string;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** True when any line exceeds stock; checkout will refuse until it is fixed. */
  hasShortfall: boolean;
}

/**
 * Find the shopper's cart, creating one only when something is about to be put
 * in it. A signed-in shopper is identified by their account; a guest by an
 * opaque token in a cookie, which is what lets a basket survive a page reload
 * before anyone has registered.
 */
export async function resolveCart(
  req: Request,
  res: Response,
  options: { create: boolean },
): Promise<{ id: string } | null> {
  const userId = req.session?.userId;

  if (userId) {
    const [existing] = await db.select({ id: carts.id }).from(carts).where(eq(carts.user_id, userId)).limit(1);
    if (existing) return existing;
    if (!options.create) return null;
    const [created] = await db.insert(carts).values({ user_id: userId }).returning({ id: carts.id });
    return created ?? null;
  }

  const token = req.cookies?.[CART_COOKIE_NAME];
  if (typeof token === "string" && token) {
    const [existing] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.session_token, token), sql`${carts.user_id} is null`))
      .limit(1);
    if (existing) return existing;
  }
  if (!options.create) return null;

  const [created] = await db
    .insert(carts)
    .values({ expires_at: new Date(Date.now() + CART_COOKIE_MAX_AGE_MS) })
    .returning({ id: carts.id, session_token: carts.session_token });
  if (!created) return null;
  res.cookie(CART_COOKIE_NAME, created.session_token, { ...cookieOptions, maxAge: CART_COOKIE_MAX_AGE_MS });
  return { id: created.id };
}

/** The cart as the browser needs it: priced lines and a subtotal. */
export async function getCartView(cartId: string | null): Promise<CartView> {
  if (!cartId) return { id: "", lines: [], itemCount: 0, subtotal: 0, hasShortfall: false };

  const rows = await db
    .select({
      id: cartItems.id,
      variantId: variants.id,
      quantity: cartItems.quantity,
      unitPrice: variants.price,
      variantName: variants.name,
      stock: variants.stock,
      isActive: variants.is_active,
      productSlug: products.slug,
      productTitle: products.title,
      images: products.images,
    })
    .from(cartItems)
    .innerJoin(variants, eq(variants.id, cartItems.variant_id))
    .innerJoin(products, eq(products.id, variants.product_id))
    .where(eq(cartItems.cart_id, cartId))
    .orderBy(asc(cartItems.created_at));

  const lines: CartLine[] = rows.map((row) => ({
    id: row.id,
    variantId: row.variantId,
    productSlug: row.productSlug,
    productTitle: row.productTitle,
    variantName: row.variantName,
    image: row.images[0] ?? null,
    unitPrice: row.unitPrice,
    quantity: row.quantity,
    lineTotal: lineTotal(row.unitPrice, row.quantity),
    stock: row.stock,
    isActive: row.isActive,
  }));

  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: sum(lines.map((line) => line.lineTotal)),
    hasShortfall: lines.some((line) => !line.isActive || line.quantity > line.stock),
  };
}

export async function addItem(cartId: string, variantId: string, quantity: number): Promise<void> {
  if (quantity < 1) throw badRequest("Choose a quantity of at least one.");

  const [variant] = await db
    .select({ id: variants.id, stock: variants.stock, isActive: variants.is_active })
    .from(variants)
    .where(eq(variants.id, variantId))
    .limit(1);
  if (!variant || !variant.isActive) throw notFound("That item is not available.");
  if (variant.stock < 1) throw conflict("That item is out of stock.");

  // One row per SKU: adding something already in the basket increases it
  // rather than producing a second line the shopper has to reconcile.
  await db
    .insert(cartItems)
    .values({ cart_id: cartId, variant_id: variantId, quantity: Math.min(quantity, MAX_LINE_QUANTITY) })
    .onConflictDoUpdate({
      target: [cartItems.cart_id, cartItems.variant_id],
      set: {
        quantity: sql`least(${cartItems.quantity} + ${quantity}, ${MAX_LINE_QUANTITY})`,
        updated_at: new Date(),
      },
    });
}

export async function updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<void> {
  if (quantity < 0) throw badRequest("Quantity cannot be negative.");
  if (quantity === 0) return removeItem(cartId, itemId);

  const updated = await db
    .update(cartItems)
    .set({ quantity: Math.min(quantity, MAX_LINE_QUANTITY), updated_at: new Date() })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cart_id, cartId)))
    .returning({ id: cartItems.id });
  if (updated.length === 0) throw notFound("That basket line could not be found.");
}

export async function removeItem(cartId: string, itemId: string): Promise<void> {
  const removed = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cart_id, cartId)))
    .returning({ id: cartItems.id });
  if (removed.length === 0) throw notFound("That basket line could not be found.");
}

export async function clearCart(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cart_id, cartId));
}

/**
 * Move a guest basket onto the account that just signed in or registered.
 *
 * Shoppers fill a basket and *then* discover they need an account, so throwing
 * that basket away at the moment of sign-in is the most expensive small bug an
 * online shop can have. If the account already has a cart, quantities are added
 * together rather than one silently replacing the other.
 */
export async function adoptCartForUser(req: Request, res: Response, userId: string): Promise<void> {
  const token = req.cookies?.[CART_COOKIE_NAME];
  if (typeof token !== "string" || !token) return;

  const [guestCart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.session_token, token), sql`${carts.user_id} is null`))
    .limit(1);
  res.clearCookie(CART_COOKIE_NAME, cookieOptions);
  if (!guestCart) return;

  const [ownCart] = await db.select({ id: carts.id }).from(carts).where(eq(carts.user_id, userId)).limit(1);

  if (!ownCart) {
    // Nothing to merge into: claim the guest cart wholesale, which keeps the
    // line ids stable for anyone holding the page open.
    await db.update(carts).set({ user_id: userId, expires_at: null, updated_at: new Date() }).where(eq(carts.id, guestCart.id));
    return;
  }

  const guestLines = await db
    .select({ variantId: cartItems.variant_id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.cart_id, guestCart.id));

  for (const line of guestLines) {
    await db
      .insert(cartItems)
      .values({ cart_id: ownCart.id, variant_id: line.variantId, quantity: line.quantity })
      .onConflictDoUpdate({
        target: [cartItems.cart_id, cartItems.variant_id],
        set: {
          quantity: sql`least(${cartItems.quantity} + ${line.quantity}, ${MAX_LINE_QUANTITY})`,
          updated_at: new Date(),
        },
      });
  }
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
