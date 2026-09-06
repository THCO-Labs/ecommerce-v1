import type { Request, Response } from "express";
import { z } from "zod";
import { parseOrThrow } from "../../common/validate.js";
import {
  adjustStock,
  createProduct,
  createVariant,
  deleteProduct,
  getProductBySlug,
  listAllProducts,
  listFeatured,
  listInventory,
  listLowStock,
  listProducts,
  listVariantsForProduct,
  relatedProducts,
  updateProduct,
  updateVariant,
} from "./product.service.js";

const slugField = z
  .string()
  .trim()
  .min(1, "Web address is required")
  .max(140)
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens");

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: slugField,
  description: z.string().trim().min(1, "Description is required").max(8000),
  summary: z.string().trim().max(400).optional(),
  images: z.array(z.string().trim().max(1000)).max(12).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
});

const variantSchema = z.object({
  productId: z.string().uuid("Choose a product"),
  sku: z.string().trim().min(1, "SKU is required").max(80),
  name: z.string().trim().min(1, "Name is required").max(120),
  price: z.coerce.number().min(0, "Price cannot be negative").max(1_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
  isActive: z.boolean().optional(),
});

const stockSchema = z.object({
  delta: z.coerce.number().int().refine((value) => value !== 0, "Enter a number of units to add or remove"),
});

const querySchema = z.object({
  category: z.string().trim().max(140).optional(),
  q: z.string().trim().max(140).optional(),
  limit: z.coerce.number().int().min(1).max(120).optional(),
});

export async function listProductsHandler(req: Request, res: Response) {
  res.json({ products: await listProducts(parseOrThrow(querySchema, req.query)) });
}

export async function featuredHandler(_req: Request, res: Response) {
  res.json({ products: await listFeatured() });
}

/** One round trip for the whole product page: the product, its SKUs and the shelf beside it. */
export async function getProductHandler(req: Request, res: Response) {
  const product = await getProductBySlug(String(req.params.slug));
  const related = await relatedProducts(product.id, product.category_id);
  res.json({ product, related });
}

export async function listAllProductsHandler(_req: Request, res: Response) {
  res.json({ products: await listAllProducts() });
}

export async function createProductHandler(req: Request, res: Response) {
  res.status(201).json({ product: await createProduct(parseOrThrow(productSchema, req.body)) });
}

export async function updateProductHandler(req: Request, res: Response) {
  res.json({ product: await updateProduct(String(req.params.id), parseOrThrow(productSchema, req.body)) });
}

export async function deleteProductHandler(req: Request, res: Response) {
  await deleteProduct(String(req.params.id));
  res.status(204).end();
}

export async function listVariantsHandler(req: Request, res: Response) {
  res.json({ variants: await listVariantsForProduct(String(req.params.id)) });
}

export async function createVariantHandler(req: Request, res: Response) {
  res.status(201).json({ variant: await createVariant(parseOrThrow(variantSchema, req.body)) });
}

export async function updateVariantHandler(req: Request, res: Response) {
  const input = parseOrThrow(variantSchema.omit({ productId: true }), req.body);
  res.json({ variant: await updateVariant(String(req.params.id), input) });
}

/** Staff may move stock; they may not touch price, which is why this is its own route. */
export async function adjustStockHandler(req: Request, res: Response) {
  const { delta } = parseOrThrow(stockSchema, req.body);
  res.json({ variant: await adjustStock(String(req.params.id), delta) });
}

export async function inventoryHandler(_req: Request, res: Response) {
  res.json({ inventory: await listInventory() });
}

export async function lowStockHandler(_req: Request, res: Response) {
  res.json({ variants: await listLowStock() });
}
