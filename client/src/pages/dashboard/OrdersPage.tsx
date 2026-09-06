import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/components/price-display";
import { ordersApi } from "@/api/orders";
import { ApiError } from "@/api/client";
import { useAsync } from "@/hooks/use-async";
import { formatDateTime, formatItems, orderStatusLabel } from "@/lib/format";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const { data, loading, error, reload } = useAsync(() => ordersApi.list(), []);
  const [saving, setSaving] = useState<string | null>(null);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setSaving(orderId);
    try {
      await ordersApi.setStatus(orderId, status);
      toast.success(`Order moved to ${orderStatusLabel(status).toLowerCase()}`);
      reload();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not update that order");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div data-builder-id="dashboard.orders">
      <h1 className="text-3xl font-semibold">Orders</h1>
      <p className="text-muted-foreground mt-2">
        Every order is cash on delivery — move it along as it is packed and sent.
      </p>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-8 rounded-lg border p-4">{error}</p>
      )}

      {loading ? (
        <Skeleton className="mt-8 h-72 w-full rounded-xl" />
      ) : (
        <Card className="mt-8">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map(({ order, items }) => (
                  <TableRow key={order.id}>
                    <TableCell className="tabular font-medium">{order.reference}</TableCell>
                    <TableCell>
                      <div>{order.customer_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {order.city}, {order.country}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(order.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatItems(items.reduce((total, item) => total + item.quantity, 0))}
                    </TableCell>
                    <TableCell className="tabular text-right">{formatMoney(order.total)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={order.status === "CANCELLED" ? "secondary" : "outline"}>
                          {orderStatusLabel(order.status)}
                        </Badge>
                        <select
                          aria-label={`Change status of ${order.reference}`}
                          className="h-8 rounded-md border bg-transparent px-2 text-xs"
                          value={order.status}
                          disabled={saving === order.id}
                          onChange={(event) => void changeStatus(order.id, event.target.value as OrderStatus)}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {orderStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data?.length === 0 && (
              <p className="text-muted-foreground p-8 text-center">No orders yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
