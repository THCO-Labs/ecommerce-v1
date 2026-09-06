import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config/app-config";

interface StockBadgeProps {
  stock: number;
  isActive?: boolean;
}

/**
 * Three states, deliberately. "Only 2 left" sells; "in stock" reassures; and
 * an out-of-stock item must say so where the shopper is looking, not at
 * checkout after they have filled in an address.
 */
export function StockBadge({ stock, isActive = true }: StockBadgeProps) {
  if (!isActive || stock <= 0) return <Badge variant="secondary">Out of stock</Badge>;
  if (stock <= appConfig.lowStockThreshold) {
    return (
      <Badge variant="outline" className="border-primary/40 text-primary">
        Only {stock} left
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      In stock
    </Badge>
  );
}
