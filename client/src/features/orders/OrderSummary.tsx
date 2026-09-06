import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PriceDisplay, formatMoney } from "@/components/price-display";
import { formatDateTime, orderStatusLabel } from "@/lib/format";
import type { OrderStatus } from "@/types";

export interface OrderSummaryLine {
  productTitle: string;
  variantName: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryProps {
  reference: string;
  status: OrderStatus;
  placedAt: string;
  items: OrderSummaryLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

/**
 * What was ordered, and what it cost.
 *
 * Rendered on the confirmation page, the order lookup, the customer's account
 * and the staff order queue — four screens showing the same facts. It is
 * registered as its own editable unit for exactly that reason: an edit made
 * from any one of those pages would change all four, and doing that by
 * accident is the failure this layout exists to prevent.
 *
 * The figures are snapshots taken at checkout, never re-derived from the live
 * catalogue, so a later price change cannot rewrite somebody's receipt.
 */
export function OrderSummary({
  reference,
  status,
  placedAt,
  items,
  subtotal,
  deliveryFee,
  total,
}: OrderSummaryProps) {
  return (
    <Card data-builder-id="order.summary">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Order</p>
            <p className="tabular text-lg font-semibold">{reference}</p>
          </div>
          <Badge variant={status === "CANCELLED" ? "secondary" : "outline"}>{orderStatusLabel(status)}</Badge>
        </div>

        <p className="text-muted-foreground text-sm">Placed {formatDateTime(placedAt)}</p>

        <Separator />

        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${item.productTitle}-${item.variantName}-${index}`} className="flex justify-between gap-4 text-sm">
              <span>
                {item.productTitle}
                <span className="text-muted-foreground"> · {item.variantName}</span>
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="tabular shrink-0">{formatMoney(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="tabular">{deliveryFee === 0 ? "Free" : formatMoney(deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-medium">Total</span>
            <PriceDisplay amount={total} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
