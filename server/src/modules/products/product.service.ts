import { and, asc, desc, eq, gt, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "../../common/db/index.js";
import { badRequest, conflict, notFound } from "../../common/errors.js";
import { categories } from "../categories/category.model.js";
import { products, type Product } from "./product.model.js";
import { variants, type Variant } from "./variant.model.js";

/** What a product card needs, and nothing more. */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string | null;
  /** Cheapest active variant, which is what "from £x" means on a card. */
  priceFrom: number;
  inStock: boolean;
  categoryName: string | null;
}

export type ProductWithVariants = Product & {
  variants: Variant[];
  categoryName: string | null;
};

export interface ProductQuery {
  category?: string;
  q?: string;
  limit?: number;
}

/**
 * Catalogue listing. Aggregating in SQL rather than fetching every variant
 * keeps a category page one round trip regardless of how deep the catalogue is.
 */
export async function listProducts(query: ProductQuery): Promise<ProductCard[]> {
  const conditions = [eq(products.is_published, true)];
  if (query.category) conditions.push(eq(categories.slug, query.category));
  if (query.q) {
    conditions.push(
      or(ilike(products.title, `%${query.q}%`), ilike(products.summary, `%${query.q}%`))!,
    );
  }

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      summary: products.summary,
      images: products.images,
      categoryName: categories.name,
      priceFrom: sql<number>`coalesce(min(${variants.price}) filter (where ${variants.is_active}), 0)::float8`,
      inStock: sql<boolean>`coalesce(bool_or(${variants.is_active} and ${variants.stock} > 0), false)`,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(variants, eq(variants.product_id, products.id))
    .where(and(...conditions))
    .groupBy(products.id, categories.name)
    .orderBy(asc(products.title))
    .limit(query.limit ?? 60);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    image: row.images[0] ?? null,
    priceFrom: Number(row.priceFrom ?? 0),
    inStock: Boolean(row.inStock),
    categoryName: row.categoryName,
  }));
}

/** Staff and admin listing: unpublished products included. */
export async function listAllProducts(): Promise<Array<Product & { categoryName: string | null; variantCount: number; totalStock: number }>> {
  const rows = await db
    .select({
      product: products,
      categoryName: categories.name,
      variantCount: sql<number>`count(${variants.id})::int`,
      totalStock: sql<number>`coalesce(sum(${variants.stock}), 0)::int`,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(variants, eq(variants.product_id, products.id))
    .groupBy(products.id, categories.name)
    .orderBy(asc(products.title));

  return rows.map((row) => ({ ...row.product, categoryName: row.categoryName, variantCount: row.variantCount, totalStock: row.totalStock }));
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants> {
  const [row] = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!row) throw notFound("That product could not be found.");

  const inventory = await db
    .select()
    .from(variants)
    .where(and(eq(variants.product_id, row.product.id), eq(variants.is_active, true)))
    .orderBy(asc(variants.price));

  return { ...row.product, variants: inventory, categoryName: row.categoryName };
}

/** Same shelf, different product. Falls back to anything published. */
export async function relatedProducts(productId: string, categoryId: string | null, limit = 4): Promise<ProductCard[]> {
  const conditions = [eq(products.is_published, true), ne(products.id, productId)];
  if (categoryId) conditions.push(eq(products.category_id, categoryId));

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      summary: products.summary,
      images: products.images,
      categoryName: categories.name,
      priceFrom: sql<number>`coalesce(min(${variants.price}) filter (where ${variants.is_active}), 0)::float8`,
      inStock: sql<boolean>`coalesce(bool_or(${variants.is_active} and ${variants.stock} > 0), false)`,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(variants, eq(variants.product_id, products.id))
    .where(and(...conditions))
    .groupBy(products.id, categories.name)
    .orderBy(asc(products.title))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    image: row.images[0] ?? null,
    priceFrom: Number(row.priceFrom ?? 0),
    inStock: Boolean(row.inStock),
    categoryName: row.categoryName,
  }));
}

export interface ProductInput {
  title: string;
  slug: string;
  description: string;
  summary?: string;
  images?: string[];
  categoryId?: string | null;
  isPublished?: boolean;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
  if (existing) throw conflict("A product with that web address already exists.");
  const [created] = await db.insert(products).values(toRow(input)).returning();
  return created;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const [updated] = await db
    .update(products)
    .set({ ...toRow(input), updated_at: new Date() })
    .where(eq(products.id, id))
    .returning();
  if (!updated) throw notFound("That product could not be found.");
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const removed = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (removed.length === 0) throw notFound("That product could not be found.");
}

export interface VariantInput {
  productId: string;
  sku: string;
  name: string;
  price: number;
  stock?: number;
  isActive?: boolean;
}

export async function createVariant(input: VariantInput): Promise<Variant> {
  const [existing] = await db.select({ id: variants.id }).from(variants).where(eq(variants.sku, input.sku)).limit(1);
  if (existing) throw conflict("That SKU is already in use.");
  const [created] = await db
    .insert(variants)
    .values({
      product_id: input.productId,
      sku: input.sku,
      name: input.name,
      price: input.price,
      stock: input.stock ?? 0,
      is_active: input.isActive ?? true,
    })
    .returning();
  return created;
}

/** Admin only — this can change a price. */
export async function updateVariant(id: string, input: Omit<VariantInput, "productId">): Promise<Variant> {
  const [updated] = await db
    .update(variants)
    .set({
      sku: input.sku,
      name: input.name,
      price: input.price,
      stock: input.stock ?? 0,
      is_active: input.isActive ?? true,
      updated_at: new Date(),
    })
    .where(eq(variants.id, id))
    .returning();
  if (!updated) throw notFound("That variant could not be found.");
  return updated;
}

/**
 * Restocking is the one inventory action staff may take, and it deliberately
 * cannot touch price. `delta` is relative so two people counting the same shelf
 * at once add up rather than overwrite each other.
 */
export async function adjustStock(variantId: string, delta: number): Promise<Variant> {
  if (!Number.isInteger(delta) || delta === 0) throw badRequest("Enter a whole number of units to add or remove.");
  const [updated] = await db
    .update(variants)
    .set({ stock: sql`greatest(${variants.stock} + ${delta}, 0)`, updated_at: new Date() })
    .where(eq(variants.id, variantId))
    .returning();
  if (!updated) throw notFound("That variant could not be found.");
  return updated;
}

/** The restock worklist: active SKUs at or below a threshold, lowest first. */
export async function listLowStock(threshold = 5): Promise<Array<Variant & { productTitle: string }>> {
  const rows = await db
    .select({ variant: variants, productTitle: products.title })
    .from(variants)
    .innerJoin(products, eq(products.id, variants.product_id))
    .where(eq(variants.is_active, true))
    .orderBy(asc(variants.stock), asc(products.title));
  return rows.filter((row) => row.variant.stock <= threshold).map((row) => ({ ...row.variant, productTitle: row.productTitle }));
}

/** Full inventory view for the restock screen. */
export async function listInventory(): Promise<Array<Variant & { productTitle: string; productSlug: string }>> {
  const rows = await db
    .select({ variant: variants, productTitle: products.title, productSlug: products.slug })
    .from(variants)
    .innerJoin(products, eq(products.id, variants.product_id))
    .orderBy(asc(products.title), asc(variants.name));
  return rows.map((row) => ({ ...row.variant, productTitle: row.productTitle, productSlug: row.productSlug }));
}

/** Variants belonging to one product, including inactive ones, for the admin editor. */
export async function listVariantsForProduct(productId: string): Promise<Variant[]> {
  return db.select().from(variants).where(eq(variants.product_id, productId)).orderBy(asc(variants.name));
}

/** Newest published products, for the homepage strip. */
export async function listFeatured(limit = 8): Promise<ProductCard[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      summary: products.summary,
      images: products.images,
      categoryName: categories.name,
      createdAt: products.created_at,
      priceFrom: sql<number>`coalesce(min(${variants.price}) filter (where ${variants.is_active}), 0)::float8`,
      inStock: sql<boolean>`coalesce(bool_or(${variants.is_active} and ${variants.stock} > 0), false)`,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(variants, eq(variants.product_id, products.id))
    .where(eq(products.is_published, true))
    .groupBy(products.id, categories.name)
    .orderBy(desc(products.created_at))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    image: row.images[0] ?? null,
    priceFrom: Number(row.priceFrom ?? 0),
    inStock: Boolean(row.inStock),
    categoryName: row.categoryName,
  }));
}

/** Guards a checkout line before stock is touched. */
export async function assertPurchasable(variantId: string, quantity: number): Promise<Variant> {
  const [variant] = await db.select().from(variants).where(and(eq(variants.id, variantId), eq(variants.is_active, true))).limit(1);
  if (!variant) throw notFound("An item in your basket is no longer available.");
  if (variant.stock < quantity) throw conflict(`Only ${variant.stock} left of ${variant.name}.`);
  return variant;
}

/** Anything still buyable, used to decide whether the shop can take orders. */
export async function hasSellableStock(): Promise<boolean> {
  const [row] = await db
    .select({ id: variants.id })
    .from(variants)
    .where(and(eq(variants.is_active, true), gt(variants.stock, 0)))
    .limit(1);
  return Boolean(row);
}

function toRow(input: ProductInput) {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    summary: input.summary ?? "",
    images: input.images ?? [],
    category_id: input.categoryId ?? null,
    is_published: input.isPublished ?? true,
  };
}
