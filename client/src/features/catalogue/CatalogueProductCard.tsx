import { ProductCardBase } from "@/components/product/product-card-base";
import type { ProductCard } from "@/types";

/**
 * The catalogue grid's card: denser than the homepage's, because the grid shows
 * many at once and a paragraph per tile makes the page unreadable.
 *
 * Layout only — see `ProductCardBase` for why the data binding lives elsewhere.
 * This file is in the catalogue page's boundary alone.
 */
export function CatalogueProductCard({ product }: { product: ProductCard }) {
  return (
    <ProductCardBase
      product={product}
      imageClassName="aspect-square"
      titleClassName="text-sm"
      showSummary={false}
    />
  );
}
