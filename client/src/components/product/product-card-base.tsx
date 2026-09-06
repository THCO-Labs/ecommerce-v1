import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PriceDisplay } from "@/components/price-display";
import { StockBadge } from "@/components/stock-badge";
import { routes } from "@/config/app-config";
import { cn } from "@/lib/utils";
import type { ProductCard } from "@/types";

/**
 * The data contract for a product card — and only the data contract.
 *
 * A product card renders on the homepage, in the catalogue grid and in the
 * related strip, and each of those wants it to look different. Registering one
 * shared card as an editable component would mean "make the homepage cards
 * bigger" silently restyled all three; protecting it outright would make that
 * very ordinary request impossible.
 *
 * So this file owns what must not drift — which image, which price, whether it
 * is in stock, where the link goes — and is protected. Layout belongs to the
 * per-page wrappers in `features/`, each of which sits inside exactly one
 * page's edit boundary and can be restyled without touching the other two.
 */
/** Shipped with the template, so it renders with no network at all. */
export const PRODUCT_PLACEHOLDER = "/product-placeholder.svg";

export interface ProductCardBaseProps {
  product: ProductCard;
  /** Layout for the outer card; the wrapper's main lever. */
  className?: string;
  /** Aspect and fit for the image frame. */
  imageClassName?: string;
  titleClassName?: string;
  /** Hidden on dense cards where there is no room for a sentence. */
  showSummary?: boolean;
  showStock?: boolean;
  /** Wrapper-supplied slot, typically an add-to-basket button. */
  footer?: ReactNode;
}

export function ProductCardBase({
  product,
  className,
  imageClassName,
  titleClassName,
  showSummary = true,
  showStock = true,
  footer,
}: ProductCardBaseProps) {
  // An image URL can stop resolving — a merchant's own link, or a photo CDN a
  // sandbox with restricted egress cannot reach. Swapping in the local
  // placeholder keeps the grid composed instead of scattering broken-image
  // glyphs through it. The guard matters: without it a placeholder that also
  // failed would retry forever.
  const [src, setSrc] = useState(product.image || PRODUCT_PLACEHOLDER);

  return (
    <article
      className={cn(
        "group bg-card flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-soft",
        className,
      )}
    >
      <Link to={routes.product(product.slug)} className="block">
        <div className={cn("bg-muted relative aspect-square overflow-hidden", imageClassName)}>
          <img
            src={src}
            alt={product.title}
            loading="lazy"
            onError={() => setSrc((current) => (current === PRODUCT_PLACEHOLDER ? current : PRODUCT_PLACEHOLDER))}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName && (
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {product.categoryName}
          </p>
        )}
        <h3 className={cn("leading-snug font-medium", titleClassName)}>
          <Link to={routes.product(product.slug)} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>
        {showSummary && product.summary && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{product.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceDisplay amount={product.priceFrom} from />
          {showStock && <StockBadge stock={product.inStock ? 99 : 0} />}
        </div>
        {footer}
      </div>
    </article>
  );
}
