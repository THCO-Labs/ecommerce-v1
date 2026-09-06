import { ProductCardBase } from "@/components/product/product-card-base";
import type { ProductCard } from "@/types";

/**
 * The homepage's product card: generous, with room for a sentence.
 *
 * Layout only. What the card *says* — image, price, stock, link — belongs to
 * `ProductCardBase`, which is protected. This file sits in the homepage's edit
 * boundary alone, so "make the cards on the homepage bigger" changes this and
 * nothing on the catalogue or product pages.
 */
export function FeaturedProductCard({ product }: { product: ProductCard }) {
  return (
    <ProductCardBase
      product={product}
      className="shadow-soft"
      imageClassName="aspect-[4/3]"
      titleClassName="text-base"
      showSummary
    />
  );
}
