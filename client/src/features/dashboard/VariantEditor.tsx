import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/components/price-display";
import { productsApi } from "@/api/catalogue";
import { ApiError } from "@/api/client";
import type { AdminProduct, Variant } from "@/types";

/**
 * The SKUs beneath a product. Price lives here rather than on the product,
 * because a large one and a small one are different money.
 *
 * Stock is shown but not edited here — moving units is the inventory screen's
 * job, and staff can do that without being able to touch price.
 */
export function VariantEditor({ product }: { product: AdminProduct }) {
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    productsApi
      .variants(product.id)
      .then((rows) => active && setVariants(rows))
      .catch(() => active && setVariants([]));
    return () => {
      active = false;
    };
  }, [product.id]);

  async function addVariant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await productsApi.createVariant({
        productId: product.id,
        sku: sku.trim(),
        name: name.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
      });
      setVariants((current) => [...(current ?? []), created]);
      setSku("");
      setName("");
      setPrice("");
      setStock("0");
      toast.success(`${created.sku} added`);
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not add that variant");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-builder-id="dashboard.variant-editor" className="space-y-4">
      <h3 className="font-medium">Variants</h3>

      {variants === null ? (
        <Skeleton className="h-20 w-full" />
      ) : variants.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No variants yet. A product needs at least one before it can be bought.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {variants.map((variant) => (
            <li key={variant.id} className="flex items-center justify-between gap-4 p-3 text-sm">
              <div>
                <p className="font-medium">{variant.name}</p>
                <p className="text-muted-foreground tabular text-xs">{variant.sku}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="tabular">{formatMoney(variant.price)}</span>
                <span className="text-muted-foreground tabular text-xs">{variant.stock} in stock</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addVariant} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="variant-name">Name</Label>
          <Input
            id="variant-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Large"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="variant-sku">SKU</Label>
          <Input
            id="variant-sku"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder="NW-SHELF-L"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="variant-price">Price</Label>
          <Input
            id="variant-price"
            type="number"
            min="0"
            step="0.01"
            className="w-24"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="variant-stock">Stock</Label>
          <Input
            id="variant-stock"
            type="number"
            min="0"
            className="w-20"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          Add
        </Button>
      </form>
    </div>
  );
}
