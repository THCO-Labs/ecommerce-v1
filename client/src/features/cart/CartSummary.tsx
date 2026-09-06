import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PriceDisplay, formatMoney } from "@/components/price-display";
import { appConfig } from "@/config/app-config";
import { formatItems } from "@/lib/format";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  footer?: ReactNode;
}

/** Delivery is free above a threshold; the rule lives here so both callers agree. */
export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= appConfig.freeDeliveryOver ? 0 : appConfig.deliveryFee;
}

/**
 * The money panel, shown on the basket and again at checkout.
 *
 * It is registered as its own editable unit rather than as a dependency of
 * those two pages: the totals must say the same thing in both places, and an
 * edit made from one page that silently changed the other is exactly the
 * failure this template's layout is designed to prevent.
 */
export function CartSummary({ subtotal, itemCount, footer }: CartSummaryProps) {
  const delivery = deliveryFeeFor(subtotal);
  const remaining = appConfig.freeDeliveryOver - subtotal;

  return (
    <Card data-builder-id="cart.summary">
      <CardContent className="space-y-4 p-6">
        <h2 className="font-semibold">Order summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{formatItems(itemCount)}</span>
            <PriceDisplay amount={subtotal} className="font-normal" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="tabular">{delivery === 0 ? "Free" : formatMoney(delivery)}</span>
          </div>
        </div>

        {delivery > 0 && remaining > 0 && (
          <p className="bg-secondary text-secondary-foreground rounded-md px-3 py-2 text-xs">
            Spend {formatMoney(remaining)} more for free delivery.
          </p>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-medium">Total to pay</span>
          <PriceDisplay amount={subtotal + delivery} className="text-lg" />
        </div>
        <p className="text-muted-foreground text-xs">{appConfig.tagline} — nothing is charged online.</p>

        {footer}
      </CardContent>
    </Card>
  );
}
