import { Router } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.js";
import {
  checkoutHandler,
  listOrdersHandler,
  lookupHandler,
  metricsHandler,
  myOrdersHandler,
  orderSummaryHandler,
  updateStatusHandler,
} from "./order.controller.js";

export const orderRoutes = Router();

// Checkout and reference lookup stay public: shoppers order without an account.
orderRoutes.post("/", checkoutHandler);
orderRoutes.get("/lookup", lookupHandler);

// Literal paths before `/:reference`, or the parameter swallows them.
orderRoutes.get("/me", requireAuth, myOrdersHandler);
orderRoutes.get("/metrics", requireRole("staff", "admin"), metricsHandler);

// Fulfilment is operational work: staff and admin both do it.
orderRoutes.get("/", requireRole("staff", "admin"), listOrdersHandler);
orderRoutes.patch("/:id/status", requireRole("staff", "admin"), updateStatusHandler);

orderRoutes.get("/:reference/summary", orderSummaryHandler);
