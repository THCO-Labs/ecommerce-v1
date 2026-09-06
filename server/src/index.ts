// Loaded first so dotenv populates process.env before any other module reads it.
import { env } from "./common/env.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./common/errors.js";
import { attachSession } from "./common/middleware/auth.js";
import { authRoutes, userRoutes } from "./modules/auth/auth.routes.js";
import { categoryRoutes } from "./modules/categories/category.routes.js";
import { productRoutes } from "./modules/products/product.routes.js";
import { cartRoutes } from "./modules/cart/cart.routes.js";
import { orderRoutes } from "./modules/orders/order.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // The session and the guest cart both travel in cookies, so the browser needs
  // `credentials: true`, and that forbids the `*` origin — every client origin
  // must be listed.
  app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));

  // Every route can read `req.session`; each one decides whether it cares.
  app.use(attachSession);

  // Deliberately touches nothing external so it still answers when Postgres is
  // down — a database outage must not be reported as a broken deployment.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);

  // Express 5 forwards rejected promises from handlers here on its own, so
  // async handlers need no wrapper. Order matters: 404 first, then the formatter.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

app.listen(env.PORT, () => {
  const origins = env.CLIENT_ORIGINS.join(", ");
  console.log(`API listening on http://localhost:${env.PORT} (allowed client origins: ${origins})`);
});
