import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../../common/db/index.js";
import { badRequest, conflict, notFound } from "../../common/errors.js";
import { lineTotal, round2, sum } from "../../common/money.js";
import { cartItems } from "../cart/cart.model.js";
import { products } from "../products/product.model.js";
import { variants } from "../products/variant.model.js";
import { orderItems, orders, type Order, type OrderItem, type OrderStatus } from "./order.model.js";

/** Flat delivery charge; a real shop would price this by zone. */
const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_OVER = 50;

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  notes?: string;
  userId?: string;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
}

export interface DashboardMetrics {
  orders_today: number;
  pending_fulfilment: number;
  revenue_this_month: number;
  low_stock_count: number;
}

function reference(): string {
  return `NW-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
}

/**
 * Turn a basket into an order.
 *
 * Everything happens in one transaction, and stock is decremented with a
 * conditional update — `where stock >= quantity` — so two shoppers racing for
 * the last unit cannot both succeed. The loser gets a 409 naming the item
 * rather than an oversold order nobody can fulfil.
 *
 * Nothing is charged: this is cash on delivery.
 */
export async function checkout(cartId: string, input: CheckoutInput): Promise<OrderDetail> {
  return db.transaction(async (tx) => {
    const lines = await tx
      .select({
        variantId: variants.id,
        quantity: cartItems.quantity,
        unitPrice: variants.price,
        variantName: variants.name,
        isActive: variants.is_active,
        productTitle: products.title,
      })
      .from(cartItems)
      .innerJoin(variants, eq(variants.id, cartItems.variant_id))
      .innerJoin(products, eq(products.id, variants.product_id))
      .where(eq(cartItems.cart_id, cartId));

    if (lines.length === 0) throw badRequest("Your basket is empty.");

    for (const line of lines) {
      if (!line.isActive) throw conflict(`${line.productTitle} is no longer available.`);
      // Conditional decrement: the row only moves if it still has the units.
      const claimed = await tx
        .update(variants)
        .set({ stock: sql`${variants.stock} - ${line.quantity}`, updated_at: new Date() })
        .where(and(eq(variants.id, line.variantId), gte(variants.stock, line.quantity)))
        .returning({ id: variants.id });
      if (claimed.length === 0) {
        throw conflict(`${line.productTitle} (${line.variantName}) does not have enough stock left.`);
      }
    }

    const subtotal = sum(lines.map((line) => lineTotal(line.unitPrice, line.quantity)));
    const delivery = deliveryFeeFor(subtotal);

    const [order] = await tx
      .insert(orders)
      .values({
        reference: reference(),
        user_id: input.userId ?? null,
        customer_name: input.customerName,
        customer_email: input.customerEmail.toLowerCase(),
        customer_phone: input.customerPhone,
        address_line1: input.addressLine1,
        address_line2: input.addressLine2 || null,
        city: input.city,
        region: input.region ?? "",
        postal_code: input.postalCode ?? "",
        country: input.country,
        subtotal,
        delivery_fee: delivery,
        total: round2(subtotal + delivery),
        payment_method: "COD",
        notes: input.notes || null,
      })
      .returning();
    if (!order) throw badRequest("Unable to place the order.");

    // Snapshot the description of what was bought. Nothing here is joined back
    // to the catalogue for display, so a later rename or price change cannot
    // rewrite somebody's receipt.
    const items = await tx
      .insert(orderItems)
      .values(
        lines.map((line) => ({
          order_id: order.id,
          variant_id: line.variantId,
          product_title: line.productTitle,
          variant_name: line.variantName,
          unit_price: line.unitPrice,
          quantity: line.quantity,
          line_total: lineTotal(line.unitPrice, line.quantity),
        })),
      )
      .returning();

    await tx.delete(cartItems).where(eq(cartItems.cart_id, cartId));
    return { order, items };
  });
}

/** Reference plus email is the guest's credential, so both match case-insensitively. */
export async function lookupOrder(ref: string, email: string): Promise<OrderDetail | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        sql`upper(${orders.reference}) = ${ref.trim().toUpperCase()}`,
        sql`lower(${orders.customer_email}) = ${email.trim().toLowerCase()}`,
      ),
    )
    .limit(1);
  if (!order) return null;
  return { order, items: await itemsFor(order.id) };
}

export async function getOrderByReference(ref: string): Promise<OrderDetail> {
  const [order] = await db.select().from(orders).where(eq(orders.reference, ref)).limit(1);
  if (!order) throw notFound("That order could not be found.");
  return { order, items: await itemsFor(order.id) };
}

/** Orders are matched on email, so a guest checkout still shows up after signing up. */
export async function listOrdersForEmail(email: string): Promise<OrderDetail[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(sql`lower(${orders.customer_email}) = ${email.trim().toLowerCase()}`)
    .orderBy(desc(orders.created_at));
  return withItems(rows);
}

/** The fulfilment queue: open work first, then everything else. */
export async function listOrders(): Promise<OrderDetail[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.created_at));
  return withItems(rows);
}

const OPEN_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED", "DISPATCHED"];

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const [updated] = await db
    .update(orders)
    .set({ status, updated_at: new Date() })
    .where(eq(orders.id, id))
    .returning();
  if (!updated) throw notFound("That order could not be found.");
  return updated;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [[today], [pending], [revenue], [lowStock]] = await Promise.all([
    db.select({ value: count() }).from(orders).where(gte(orders.created_at, startOfDay)),
    db.select({ value: count() }).from(orders).where(inArray(orders.status, OPEN_STATUSES)),
    db
      .select({ value: sql<number>`coalesce(sum(${orders.total}), 0)::float8` })
      .from(orders)
      .where(and(gte(orders.created_at, startOfMonth), sql`${orders.status} <> 'CANCELLED'`)),
    db
      .select({ value: count() })
      .from(variants)
      .where(and(eq(variants.is_active, true), sql`${variants.stock} <= 5`)),
  ]);

  return {
    orders_today: today.value,
    pending_fulfilment: pending.value,
    revenue_this_month: round2(Number(revenue.value ?? 0)),
    low_stock_count: lowStock.value,
  };
}

async function itemsFor(orderId: string): Promise<OrderItem[]> {
  return db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
}

/** One extra query for every line rather than one per order. */
async function withItems(rows: Order[]): Promise<OrderDetail[]> {
  if (rows.length === 0) return [];
  const all = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.order_id, rows.map((row) => row.id)));
  const grouped = new Map<string, OrderItem[]>();
  for (const item of all) {
    const list = grouped.get(item.order_id) ?? [];
    list.push(item);
    grouped.set(item.order_id, list);
  }
  return rows.map((order) => ({ order, items: grouped.get(order.id) ?? [] }));
}
