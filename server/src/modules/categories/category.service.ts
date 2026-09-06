import { asc, eq } from "drizzle-orm";
import { db } from "../../common/db/index.js";
import { conflict, notFound } from "../../common/errors.js";
import { categories, type Category } from "./category.model.js";

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  position?: number;
}

/** Merchant-chosen order, never alphabetical. */
export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.position), asc(categories.name));
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!category) throw notFound("That category could not be found.");
  return category;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.slug)).limit(1);
  if (existing) throw conflict("A category with that web address already exists.");
  const [created] = await db.insert(categories).values(toRow(input)).returning();
  return created;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const [updated] = await db
    .update(categories)
    .set({ ...toRow(input), updated_at: new Date() })
    .where(eq(categories.id, id))
    .returning();
  if (!updated) throw notFound("That category could not be found.");
  return updated;
}

/**
 * Products filed under a deleted category keep existing — the foreign key is
 * `on delete set null`. Losing a shelf label should never lose the stock.
 */
export async function deleteCategory(id: string): Promise<void> {
  const removed = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  if (removed.length === 0) throw notFound("That category could not be found.");
}

function toRow(input: CategoryInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    position: input.position ?? 0,
  };
}
