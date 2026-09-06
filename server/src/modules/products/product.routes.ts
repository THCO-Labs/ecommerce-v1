import { Router } from "express";
import { requireRole } from "../../common/middleware/auth.js";
import {
  adjustStockHandler,
  createProductHandler,
  createVariantHandler,
  deleteProductHandler,
  featuredHandler,
  getProductHandler,
  inventoryHandler,
  listAllProductsHandler,
  listProductsHandler,
  listVariantsHandler,
  lowStockHandler,
  updateProductHandler,
  updateVariantHandler,
} from "./product.controller.js";

export const productRoutes = Router();

// Literal paths are declared before `/:slug`, or the parameter swallows them.
productRoutes.get("/", listProductsHandler);
productRoutes.get("/featured", featuredHandler);
productRoutes.get("/all", requireRole("staff", "admin"), listAllProductsHandler);
productRoutes.get("/inventory", requireRole("staff", "admin"), inventoryHandler);
productRoutes.get("/low-stock", requireRole("staff", "admin"), lowStockHandler);

// Variant routes come before `/:id`, so "variants" is never read as an id.
productRoutes.post("/variants", requireRole("admin"), createVariantHandler);
productRoutes.put("/variants/:id", requireRole("admin"), updateVariantHandler);
// The one write staff are trusted with: moving units, never money.
productRoutes.patch("/variants/:id/stock", requireRole("staff", "admin"), adjustStockHandler);

productRoutes.get("/:slug", getProductHandler);
productRoutes.get("/:id/variants", requireRole("staff", "admin"), listVariantsHandler);

// Creating products, renaming them and setting prices are admin decisions.
productRoutes.post("/", requireRole("admin"), createProductHandler);
productRoutes.put("/:id", requireRole("admin"), updateProductHandler);
productRoutes.delete("/:id", requireRole("admin"), deleteProductHandler);
