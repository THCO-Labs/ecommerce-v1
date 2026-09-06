import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockBadge } from "@/components/stock-badge";
import { formatMoney } from "@/components/price-display";
import { productsApi } from "@/api/catalogue";
import { ApiError } from "@/api/client";
import { useAsync } from "@/hooks/use-async";

/**
 * Restocking — the one inventory action staff may take.
 *
 * Adjustments are relative rather than absolute, so two people counting the
 * same shelf at the same time add up instead of overwriting each other. Price
 * is shown but not editable here; changing it is an admin action on the
 * products screen.
 */
export default function InventoryPage() {
  const { data, loading, error, reload } = useAsync(() => productsApi.inventory(), []);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function adjust(variantId: string, delta: number) {
    if (!Number.isInteger(delta) || delta === 0) {
      toast.error("Enter a whole number of units to add or remove");
      return;
    }
    setSaving(variantId);
    try {
      const variant = await productsApi.adjustStock(variantId, delta);
      setDrafts((current) => ({ ...current, [variantId]: "" }));
      toast.success(`${variant.sku} now has ${variant.stock} in stock`);
      reload();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not adjust stock");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div data-builder-id="dashboard.inventory">
      <h1 className="text-3xl font-semibold">Inventory</h1>
      <p className="text-muted-foreground mt-2">
        Add or remove units as stock arrives and leaves. Changes are relative, so counts never clash.
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
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((row) => {
                  const draft = drafts[row.id] ?? "";
                  const delta = Number(draft);
                  const valid = draft.trim() !== "" && Number.isInteger(delta) && delta !== 0;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.productTitle}</div>
                        <div className="text-muted-foreground text-xs">{row.name}</div>
                      </TableCell>
                      <TableCell className="tabular text-muted-foreground text-sm">{row.sku}</TableCell>
                      <TableCell className="tabular text-right">{formatMoney(row.price)}</TableCell>
                      <TableCell className="tabular text-right font-medium">{row.stock}</TableCell>
                      <TableCell>
                        <StockBadge stock={row.stock} isActive={row.is_active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label={`Remove one ${row.sku}`}
                            disabled={saving === row.id || row.stock <= 0}
                            onClick={() => void adjust(row.id, -1)}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <Input
                            aria-label={`Adjustment for ${row.sku}`}
                            value={draft}
                            placeholder="±"
                            className="tabular h-8 w-16 text-center"
                            onChange={(event) =>
                              setDrafts((current) => ({ ...current, [row.id]: event.target.value }))
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            aria-label={`Add one ${row.sku}`}
                            disabled={saving === row.id}
                            onClick={() => void adjust(row.id, 1)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            disabled={!valid || saving === row.id}
                            onClick={() => void adjust(row.id, delta)}
                          >
                            Apply
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {data?.length === 0 && (
              <p className="text-muted-foreground p-8 text-center">No stock lines yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
