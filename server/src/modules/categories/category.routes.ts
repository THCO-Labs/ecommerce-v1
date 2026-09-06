import { Router } from "express";
import { requireRole } from "../../common/middleware/auth.js";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from "./category.controller.js";

export const categoryRoutes = Router();

// The shelf labels are public; rearranging the shop is an admin decision.
categoryRoutes.get("/", listCategoriesHandler);
categoryRoutes.post("/", requireRole("admin"), createCategoryHandler);
categoryRoutes.put("/:id", requireRole("admin"), updateCategoryHandler);
categoryRoutes.delete("/:id", requireRole("admin"), deleteCategoryHandler);
