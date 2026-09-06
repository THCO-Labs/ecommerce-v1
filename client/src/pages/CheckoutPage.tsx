import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/app-config";
import { ApiError } from "@/api/client";
import { ordersApi, type CheckoutInput } from "@/api/orders";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { CartSummary } from "@/features/cart/CartSummary";
import { DeliveryFields } from "@/features/checkout/DeliveryFields";

const EMPTY: CheckoutInput = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United Kingdom",
  notes: "",
};

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<CheckoutInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();

  // Signed-in shoppers should not retype what the account already knows.
  useEffect(() => {
    if (!user) return;
    setValues((current) => ({
      ...current,
      customerName: current.customerName || (user.fullName ?? ""),
      customerEmail: current.customerEmail || user.email,
      customerPhone: current.customerPhone || (user.phone ?? ""),
    }));
  }, [user]);

  if (cart.lines.length === 0) {
    return (
      <div className="container grid min-h-[60vh] place-items-center py-12 text-center">
        <div>
          <h1 className="text-3xl font-semibold">Nothing to check out</h1>
          <p className="text-muted-foreground mt-3">Your basket is empty.</p>
          <Button asChild className="mt-6">
            <Link to={routes.products}>Browse the shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors(undefined);
    try {
      const { order } = await ordersApi.checkout(values);
      // The basket is cleared server-side by checkout; re-read so the header
      // badge does not keep showing items that have become an order.
      await refresh();
      navigate(routes.confirmation(order.reference), { state: { justPlaced: true } });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors(cause.fieldErrors);
        // A 409 means stock moved under us; the basket page explains what.
        if (cause.status === 409) await refresh();
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div data-builder-id="checkout.form" className="container py-12">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="text-muted-foreground mt-2">
        Pay cash when your order arrives. Nothing is charged online.
      </p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="p-6">
            {error && (
              <p className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-lg border p-4 text-sm">
                {error}
              </p>
            )}
            <DeliveryFields
              values={values}
              onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
              fieldErrors={fieldErrors}
            />
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary
            subtotal={cart.subtotal}
            itemCount={cart.itemCount}
            footer={
              <Button type="submit" size="lg" className="w-full" disabled={submitting || cart.hasShortfall}>
                {submitting ? "Placing order…" : "Place order"}
              </Button>
            }
          />
          {cart.hasShortfall && (
            <p className="text-destructive mt-3 text-sm">
              Something in your basket is unavailable.{" "}
              <Link to={routes.cart} className="underline">
                Review your basket
              </Link>
              .
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
