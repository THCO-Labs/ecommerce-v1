import { api } from "./client";
import type {
  AdminProduct,
  Category,
  InventoryRow,
  ProductCard,
  ProductWithVariants,
  Variant,
} from "@/types";

export interface ProductQuery {
  category?: string;
  q?: string;
  limit?: number;
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

export interface VariantInput {
  productId: string;
  sku: string;
  name: string;
  price: number;
  stock?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { categories } = await api.get<{ categories: Category[] }>("/categories");
    return categories;
  },
};

export const productsApi = {
  async list(query: ProductQuery = {}): Promise<ProductCard[]> {
    // Spelled out rather than passed through: the query helper takes an index
    // signature, and naming the params keeps the wire contract visible here.
    const { products } = await api.get<{ products: ProductCard[] }>("/products", {
      category: query.category,
      q: query.q,
      limit: query.limit,
    });
    return products;
  },
  async featured(): Promise<ProductCard[]> {
    const { products } = await api.get<{ products: ProductCard[] }>("/products/featured");
    return products;
  },
  /** One round trip for the whole product page. */
  async detail(slug: string): Promise<{ product: ProductWithVariants; related: ProductCard[] }> {
    return api.get<{ product: ProductWithVariants; related: ProductCard[] }>(`/products/${slug}`);
  },

  // --- staff and admin ---
  async listAll(): Promise<AdminProduct[]> {
    const { products } = await api.get<{ products: AdminProduct[] }>("/products/all");
    return products;
  },
  async inventory(): Promise<InventoryRow[]> {
    const { inventory } = await api.get<{ inventory: InventoryRow[] }>("/products/inventory");
    return inventory;
  },
  async create(input: ProductInput): Promise<AdminProduct> {
    const { product } = await api.post<{ product: AdminProduct }>("/products", input);
    return product;
  },
  async update(id: string, input: ProductInput): Promise<AdminProduct> {
    const { product } = await api.put<{ product: AdminProduct }>(`/products/${id}`, input);
    return product;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
  async variants(productId: string): Promise<Variant[]> {
    const { variants } = await api.get<{ variants: Variant[] }>(`/products/${productId}/variants`);
    return variants;
  },
  async createVariant(input: VariantInput): Promise<Variant> {
    const { variant } = await api.post<{ variant: Variant }>("/products/variants", input);
    return variant;
  },
  async updateVariant(id: string, input: Omit<VariantInput, "productId">): Promise<Variant> {
    const { variant } = await api.put<{ variant: Variant }>(`/products/variants/${id}`, input);
    return variant;
  },
  /** Relative, so two people counting the same shelf add up rather than overwrite. */
  async adjustStock(variantId: string, delta: number): Promise<Variant> {
    const { variant } = await api.patch<{ variant: Variant }>(`/products/variants/${variantId}/stock`, { delta });
    return variant;
  },
};
