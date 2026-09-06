import { useState } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_PLACEHOLDER } from "@/components/product/product-card-base";
import { routes } from "@/config/app-config";
import { cn } from "@/lib/utils";
import type { ProductCard } from "@/types";

/**
 * Product photography beside the hero copy, in two columns of unequal height so
 * the eye moves down the page rather than bouncing off a symmetrical block.
 *
 * It has to hold its shape when there is nothing to show. A shop with an empty
 * catalogue — a fresh project before seeding, or one whose products were all
 * unpublished — still renders a composed arrangement rather than a single blank
 * rectangle, because an empty hero reads as broken rather than as new.
 */
export function HeroCollage({ products }: { products: ProductCard[] }) {
  const tiles = products.slice(0, 4);
  const left = tiles.filter((_, index) => index % 2 === 0);
  const right = tiles.filter((_, index) => index % 2 === 1);

  return (
    <div data-builder-id="homepage.collage" className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* The left column sits lower, which is the whole trick. */}
      <div className="mt-8 space-y-3 sm:mt-14 sm:space-y-4">
        {left.length > 0 ? (
          left.map((product, index) => (
            <Tile key={product.id} product={product} ratio={index === 0 ? "aspect-[4/5]" : "aspect-square"} />
          ))
        ) : (
          <>
            <Empty ratio="aspect-[4/5]" />
            <Empty ratio="aspect-square" />
          </>
        )}
      </div>
      <div className="space-y-3 sm:space-y-4">
        {right.length > 0 ? (
          right.map((product, index) => (
            <Tile key={product.id} product={product} ratio={index === 0 ? "aspect-square" : "aspect-[4/5]"} />
          ))
        ) : (
          <>
            <Empty ratio="aspect-square" />
            <Empty ratio="aspect-[4/5]" />
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ product, ratio }: { product: ProductCard; ratio: string }) {
  // Falls back to the shipped placeholder when a photo cannot be fetched, so a
  // sandbox with restricted egress still shows a composed hero. The guard stops
  // a placeholder that also failed from retrying forever.
  const [src, setSrc] = useState(product.image || PRODUCT_PLACEHOLDER);

  return (
    <Link
      to={routes.product(product.slug)}
      className="group block overflow-hidden rounded-sm"
      aria-label={product.title}
    >
      <div className={cn("bg-secondary relative overflow-hidden", ratio)}>
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setSrc((current) => (current === PRODUCT_PLACEHOLDER ? current : PRODUCT_PLACEHOLDER))}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}

/** A tile with nothing behind it, shaped like the ones that do have something. */
function Empty({ ratio }: { ratio: string }) {
  return (
    <div className={cn("bg-secondary overflow-hidden rounded-sm", ratio)} aria-hidden="true">
      <img src={PRODUCT_PLACEHOLDER} alt="" className="size-full object-cover opacity-60" />
    </div>
  );
}
