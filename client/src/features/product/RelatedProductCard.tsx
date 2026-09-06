import { ProductCardBase } from "@/components/product/product-card-base";
import type { ProductCard } from "@/types";

/**
 * The "you might also like" strip: the quietest of the three, with no stock
 * badge, because it sits below the thing the shopper actually came for and
 * must not compete with it.
 *
 * Layout only. This file is in the product page's boundary alone.
 */
export function RelatedProductCard({ product }: { product: ProductCard }) {
  return (
    <ProductCardBase
      product={product}
      className="border-transparent shadow-none hover:border-border"
      imageClassName="aspect-square"
      titleClassName="text-sm"
      showSummary={false}
      showStock={false}
    />
  );
}
