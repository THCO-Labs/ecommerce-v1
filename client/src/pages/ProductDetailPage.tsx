import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageOff, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceDisplay } from "@/components/price-display";
import { QuantityStepper } from "@/components/quantity-stepper";
import { StockBadge } from "@/components/stock-badge";
import { routes } from "@/config/app-config";
import { productsApi } from "@/api/catalogue";
import { useAsync } from "@/hooks/use-async";
import { useCart } from "@/hooks/use-cart";
import { RelatedProductCard } from "@/features/product/RelatedProductCard";
import { VariantSelector } from "@/features/product/VariantSelector";

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { data, loading, error } = useAsync(() => productsApi.detail(slug), [slug]);
  const { add } = useCart();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Default to the first variant that can actually be bought, so the price on
  // screen belongs to something the shopper can put in the basket.
  useEffect(() => {
    if (!data) return;
    const firstAvailable = data.product.variants.find((variant) => variant.stock > 0);
    setVariantId((firstAvailable ?? data.product.variants[0])?.id ?? null);
    setQuantity(1);
  }, [data]);

  if (loading) {
    return (
      <div className="container grid gap-10 py-12 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container grid min-h-[60vh] place-items-center py-12 text-center">
        <div>
          <h1 className="text-3xl font-semibold">Product not found</h1>
          <p className="text-muted-foreground mt-3">{error || "That product may have been removed."}</p>
          <Button asChild className="mt-6">
            <Link to={routes.products}>Back to the shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { product, related } = data;
  const selected = product.variants.find((variant) => variant.id === variantId) ?? null;
  const image = product.images[0] ?? null;

  async function addToBasket() {
    if (!selected) return;
    setAdding(true);
    await add(selected.id, quantity);
    setAdding(false);
    toast.success(`${product.title} added to your basket`);
  }

  return (
    <div data-builder-id="product.detail" className="container py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="bg-muted aspect-square overflow-hidden rounded-2xl">
          {image ? (
            <img src={image} alt={product.title} className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground grid size-full place-items-center">
              <ImageOff className="size-12" aria-hidden="true" />
            </div>
          )}
        </div>

        <div>
          {product.categoryName && (
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {product.categoryName}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold">{product.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            {selected && <PriceDisplay amount={selected.price} className="text-2xl" />}
            {selected && <StockBadge stock={selected.stock} isActive={selected.is_active} />}
          </div>

          <p className="text-muted-foreground mt-5 leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-5">
            <VariantSelector variants={product.variants} selectedId={variantId} onSelect={setVariantId} />

            <div className="flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.max(selected?.stock ?? 1, 1)}
                disabled={!selected || selected.stock <= 0}
              />
              <Button size="lg" onClick={addToBasket} disabled={!selected || selected.stock <= 0 || adding}>
                <ShoppingBag className="size-4" />
                {selected && selected.stock <= 0 ? "Out of stock" : "Add to basket"}
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">
              Pay cash when it arrives. Nothing is charged online.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <RelatedProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
