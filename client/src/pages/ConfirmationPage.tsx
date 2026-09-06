import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/app-config";
import { ordersApi } from "@/api/orders";
import { useAsync } from "@/hooks/use-async";
import { OrderSummary } from "@/features/orders/OrderSummary";

/**
 * Reached straight after checkout, and reachable again later by anyone holding
 * the link. It therefore reads the *redacted* summary — items, totals, status —
 * and never the delivery address or phone number, which a reference alone is
 * not strong enough proof to reveal.
 */
export default function ConfirmationPage() {
  const { reference = "" } = useParams();
  const { data, loading, error } = useAsync(() => ordersApi.summary(reference), [reference]);

  return (
    <div data-builder-id="confirmation.receipt" className="container max-w-2xl py-16">
      <div className="text-center">
        <CheckCircle2 className="text-primary mx-auto size-16" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-semibold">Order placed</h1>
        <p className="text-muted-foreground mt-2">
          We have your order. Pay in cash when it arrives — nothing has been charged.
        </p>
      </div>

      <div className="mt-10">
        {loading && <Skeleton className="h-72 w-full rounded-xl" />}

        {error && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-4 text-sm">
            We could not load that order. Check the reference, or look it up with the email you used.
          </p>
        )}

        {data && (
          <OrderSummary
            reference={data.reference}
            status={data.status}
            placedAt={data.placedAt}
            items={data.items}
            subtotal={data.subtotal}
            deliveryFee={data.deliveryFee}
            total={data.total}
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to={routes.products}>Keep shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={routes.lookup}>Track this order</Link>
        </Button>
      </div>
    </div>
  );
}
