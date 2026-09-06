import { Boxes, PackageCheck, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/components/price-display";
import type { DashboardMetrics } from "@/types";

/**
 * The four numbers a shop is run by. Low stock is deliberately last and
 * highlighted when non-zero: it is the only tile that is a task rather than a
 * measurement.
 */
export function MetricCards({ metrics }: { metrics: DashboardMetrics }) {
  const tiles = [
    { icon: Receipt, label: "Orders today", value: String(metrics.orders_today) },
    { icon: PackageCheck, label: "Awaiting fulfilment", value: String(metrics.pending_fulfilment) },
    { icon: TrendingUp, label: "Revenue this month", value: formatMoney(metrics.revenue_this_month) },
    {
      icon: Boxes,
      label: "Low stock lines",
      value: String(metrics.low_stock_count),
      alert: metrics.low_stock_count > 0,
    },
  ];

  return (
    <div data-builder-id="dashboard.metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map(({ icon: Icon, label, value, alert }) => (
        <Card key={label}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className="tabular mt-2 text-2xl font-semibold">{value}</p>
            </div>
            <span
              className={
                alert
                  ? "bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl"
                  : "bg-secondary text-primary grid size-11 place-items-center rounded-xl"
              }
            >
              <Icon className="size-5" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
