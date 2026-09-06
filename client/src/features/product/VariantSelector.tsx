import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/price-display";
import { cn } from "@/lib/utils";
import type { Variant } from "@/types";

interface VariantSelectorProps {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
}

/**
 * Picks a SKU. A single-variant product still renders one option rather than
 * hiding the control, so the price a shopper sees is always attached to the
 * thing they are about to buy.
 *
 * Out-of-stock variants stay visible but unselectable — knowing the large one
 * exists and is gone is more useful than it silently not being listed.
 */
export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  if (variants.length === 0) {
    return <p className="text-muted-foreground text-sm">This product has no options available.</p>;
  }

  return (
    <div data-builder-id="product.variants" className="space-y-2">
      <p className="text-sm font-medium">Options</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const soldOut = variant.stock <= 0;
          return (
            <Button
              key={variant.id}
              type="button"
              variant={selectedId === variant.id ? "default" : "outline"}
              disabled={soldOut}
              onClick={() => onSelect(variant.id)}
              className={cn("h-auto flex-col items-start gap-0.5 py-2", soldOut && "line-through opacity-60")}
            >
              <span className="text-sm">{variant.name}</span>
              <PriceDisplay amount={variant.price} className="text-xs font-normal" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
