import { Link } from "react-router-dom";
import { ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceDisplay } from "@/components/price-display";
import { QuantityStepper } from "@/components/quantity-stepper";
import { routes } from "@/config/app-config";
import { useCart } from "@/hooks/use-cart";
import { CartSummary } from "@/features/cart/CartSummary";

export default function CartPage() {
  const { cart, loading, error, setQuantity, remove } = useCart();

  if (loading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-8 h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container grid min-h-[60vh] place-items-center py-12 text-center">
        <div>
          <h1 className="text-3xl font-semibold">Your basket is empty</h1>
          <p className="text-muted-foreground mt-3">Nothing here yet — go and find something.</p>
          <Button asChild className="mt-6">
            <Link to={routes.products}>Browse the shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-builder-id="cart.lines" className="container py-12">
      <h1 className="text-3xl font-semibold">Your basket</h1>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-lg border p-4 text-sm">
          {error}
        </p>
      )}

      {cart.hasShortfall && (
        <p className="border-primary/40 bg-secondary mt-6 rounded-lg border p-4 text-sm">
          Something in your basket is no longer available in the quantity you chose. Adjust it before checking out.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {cart.lines.map((line) => {
            const short = !line.isActive || line.quantity > line.stock;
            return (
              <li key={line.id}>
                <Card>
                  <CardContent className="flex gap-4 p-4">
                    <Link to={routes.product(line.productSlug)} className="bg-muted size-24 shrink-0 overflow-hidden rounded-lg">
                      {line.image ? (
                        <img src={line.image} alt={line.productTitle} className="size-full object-cover" />
                      ) : (
                        <div className="text-muted-foreground grid size-full place-items-center">
                          <ImageOff className="size-5" aria-hidden="true" />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={routes.product(line.productSlug)} className="font-medium hover:text-primary">
                            {line.productTitle}
                          </Link>
                          <p className="text-muted-foreground text-sm">{line.variantName}</p>
                        </div>
                        <PriceDisplay amount={line.lineTotal} />
                      </div>

                      {short && (
                        <p className="text-destructive text-xs">
                          {line.isActive ? `Only ${line.stock} left` : "No longer available"}
                        </p>
                      )}

                      <div className="mt-auto flex items-center gap-2">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(quantity) => void setQuantity(line.id, quantity)}
                          max={Math.max(line.stock, 1)}
                          disabled={!line.isActive}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${line.productTitle}`}
                          onClick={() => void remove(line.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary
            subtotal={cart.subtotal}
            itemCount={cart.itemCount}
            footer={
              <Button asChild size="lg" className="w-full" disabled={cart.hasShortfall}>
                <Link to={routes.checkout}>Checkout</Link>
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
