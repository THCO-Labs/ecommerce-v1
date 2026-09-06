import type { Request, Response } from "express";
import { z } from "zod";
import { parseOrThrow } from "../../common/validate.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "./category.service.js";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Web address is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(2000).optional(),
  position: z.coerce.number().int().min(0).max(999).optional(),
});

export async function listCategoriesHandler(_req: Request, res: Response) {
  res.json({ categories: await listCategories() });
}

export async function createCategoryHandler(req: Request, res: Response) {
  res.status(201).json({ category: await createCategory(parseOrThrow(categorySchema, req.body)) });
}

export async function updateCategoryHandler(req: Request, res: Response) {
  res.json({ category: await updateCategory(String(req.params.id), parseOrThrow(categorySchema, req.body)) });
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  await deleteCategory(String(req.params.id));
  res.status(204).end();
}
