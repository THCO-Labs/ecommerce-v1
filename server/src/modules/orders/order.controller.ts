import type { Request, Response } from "express";
import { z } from "zod";
import { parseOrThrow } from "../../common/validate.js";
import { notFound, unauthorized } from "../../common/errors.js";
import { findSessionUser } from "../auth/auth.service.js";
import { resolveCart } from "../cart/cart.service.js";
import {
  checkout,
  getDashboardMetrics,
  getOrderByReference,
  listOrders,
  listOrdersForEmail,
  lookupOrder,
  updateOrderStatus,
} from "./order.service.js";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(160),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerPhone: z.string().trim().min(1, "A phone number is required for delivery").max(40),
  addressLine1: z.string().trim().min(1, "Street address is required").max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(120),
  region: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(40).optional(),
  country: z.string().trim().min(1, "Country is required").max(120),
  notes: z.string().trim().max(1000).optional(),
});

const lookupSchema = z.object({
  reference: z.string().trim().min(1, "Enter your order reference"),
  email: z.string().trim().min(1, "Enter the email used to order"),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"]),
});

export async function checkoutHandler(req: Request, res: Response) {
  const input = parseOrThrow(checkoutSchema, req.body);
  const cart = await resolveCart(req, res, { create: false });
  if (!cart) throw notFound("Your basket is empty.");
  const userId = req.session?.userId;
  const result = await checkout(cart.id, userId ? { ...input, userId } : input);
  res.status(201).json(result);
}

/** A miss is not an error — the client renders "not found" copy for `null`. */
export async function lookupHandler(req: Request, res: Response) {
  const { reference, email } = parseOrThrow(lookupSchema, req.query);
  res.json({ order: await lookupOrder(reference, email) });
}

/**
 * What the confirmation page can show after a refresh, when the order is no
 * longer in router state. A reference alone proves very little, so this omits
 * the delivery address, phone and email — enough to reassure the shopper the
 * order exists, not enough to be worth guessing references for.
 */
export async function orderSummaryHandler(req: Request, res: Response) {
  const { order, items } = await getOrderByReference(String(req.params.reference));
  res.json({
    summary: {
      reference: order.reference,
      status: order.status,
      city: order.city,
      country: order.country,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      paymentMethod: order.payment_method,
      placedAt: order.created_at,
      items: items.map((item) => ({
        productTitle: item.product_title,
        variantName: item.variant_name,
        quantity: item.quantity,
        lineTotal: item.line_total,
      })),
    },
  });
}

export async function myOrdersHandler(req: Request, res: Response) {
  const user = await findSessionUser(req.session!);
  if (!user) throw unauthorized();
  res.json({ orders: await listOrdersForEmail(user.email) });
}

export async function listOrdersHandler(_req: Request, res: Response) {
  res.json({ orders: await listOrders() });
}

export async function updateStatusHandler(req: Request, res: Response) {
  const { status } = parseOrThrow(statusSchema, req.body);
  res.json({ order: await updateOrderStatus(String(req.params.id), status) });
}

export async function metricsHandler(_req: Request, res: Response) {
  res.json({ metrics: await getDashboardMetrics() });
}
