import type { Request, Response } from "express";
import { z } from "zod";
import { parseOrThrow } from "../../common/validate.js";
import { notFound } from "../../common/errors.js";
import {
  addItem,
  getCartView,
  removeItem,
  resolveCart,
  updateItemQuantity,
} from "./cart.service.js";

const addSchema = z.object({
  variantId: z.string().uuid("Choose an item"),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

const quantitySchema = z.object({ quantity: z.coerce.number().int().min(0).max(99) });

/** Reading a basket never creates one — an empty cart is a valid answer. */
export async function getCartHandler(req: Request, res: Response) {
  const cart = await resolveCart(req, res, { create: false });
  res.json({ cart: await getCartView(cart?.id ?? null) });
}

export async function addItemHandler(req: Request, res: Response) {
  const input = parseOrThrow(addSchema, req.body);
  const cart = await resolveCart(req, res, { create: true });
  if (!cart) throw notFound("Could not open a basket.");
  await addItem(cart.id, input.variantId, input.quantity);
  res.status(201).json({ cart: await getCartView(cart.id) });
}

export async function updateItemHandler(req: Request, res: Response) {
  const { quantity } = parseOrThrow(quantitySchema, req.body);
  const cart = await resolveCart(req, res, { create: false });
  if (!cart) throw notFound("Your basket is empty.");
  await updateItemQuantity(cart.id, String(req.params.itemId), quantity);
  res.json({ cart: await getCartView(cart.id) });
}

export async function removeItemHandler(req: Request, res: Response) {
  const cart = await resolveCart(req, res, { create: false });
  if (!cart) throw notFound("Your basket is empty.");
  await removeItem(cart.id, String(req.params.itemId));
  res.json({ cart: await getCartView(cart.id) });
}
