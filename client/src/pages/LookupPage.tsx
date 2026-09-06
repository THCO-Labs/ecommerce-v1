import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ordersApi } from "@/api/orders";
import { ApiError } from "@/api/client";
import { OrderSummary } from "@/features/orders/OrderSummary";
import type { OrderDetail } from "@/types";

/**
 * Reference plus email is a guest's credential for their own order — the only
 * way to see the full record, including the delivery address, without an
 * account.
 */
export default function LookupPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<OrderDetail | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await ordersApi.lookup(reference, email));
      setSearched(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-builder-id="lookup.form" className="container max-w-2xl py-14">
      <h1 className="text-3xl font-semibold">Track your order</h1>
      <p className="text-muted-foreground mt-2">
        Enter the reference from your confirmation and the email you ordered with.
      </p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={search} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="reference">Order reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="NW-1A2B3C4D"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching…" : "Find order"}
            </Button>
          </form>
          {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {searched && !result && !error && (
        <p className="text-muted-foreground mt-8 text-center">
          No order matched that reference and email. Check both and try again.
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <OrderSummary
            reference={result.order.reference}
            status={result.order.status}
            placedAt={result.order.created_at}
            items={result.items.map((item) => ({
              productTitle: item.product_title,
              variantName: item.variant_name,
              quantity: item.quantity,
              lineTotal: item.line_total,
            }))}
            subtotal={result.order.subtotal}
            deliveryFee={result.order.delivery_fee}
            total={result.order.total}
          />

          <Card>
            <CardContent className="space-y-1 p-6 text-sm">
              <h2 className="mb-2 font-semibold">Delivering to</h2>
              <p>{result.order.customer_name}</p>
              <p className="text-muted-foreground">{result.order.address_line1}</p>
              {result.order.address_line2 && <p className="text-muted-foreground">{result.order.address_line2}</p>}
              <p className="text-muted-foreground">
                {result.order.city}
                {result.order.region ? `, ${result.order.region}` : ""} {result.order.postal_code}
              </p>
              <p className="text-muted-foreground">{result.order.country}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
