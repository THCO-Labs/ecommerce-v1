import { Router } from "express";
import {
  addItemHandler,
  getCartHandler,
  removeItemHandler,
  updateItemHandler,
} from "./cart.controller.js";

/**
 * The basket is public on purpose: a shopper fills one before deciding whether
 * to make an account. Ownership is the signed cart cookie for a guest and the
 * session for a signed-in customer, resolved per request.
 */
export const cartRoutes = Router();

cartRoutes.get("/", getCartHandler);
cartRoutes.post("/items", addItemHandler);
cartRoutes.patch("/items/:itemId", updateItemHandler);
cartRoutes.delete("/items/:itemId", removeItemHandler);
