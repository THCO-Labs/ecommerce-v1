import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/app-config";
import { authApi } from "@/api/auth";
import { ordersApi } from "@/api/orders";
import { ApiError } from "@/api/client";
import { useAsync } from "@/hooks/use-async";
import { useAuth } from "@/hooks/use-auth";
import { OrderSummary } from "@/features/orders/OrderSummary";

export default function AccountPage() {
  const { user, refresh } = useAuth();
  const { data: orders, loading } = useAsync(() => ordersApi.mine(), [user?.id]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ fullName, phone });
      await refresh();
      toast.success("Details saved");
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not save your details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-builder-id="account.overview" className="container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold">Your account</h1>
      <p className="text-muted-foreground mt-2">{user?.email}</p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="font-semibold">Your details</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Used to fill in checkout, so you do not retype them every order.
          </p>
          <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your orders</h2>

        {loading && <Skeleton className="mt-5 h-56 w-full rounded-xl" />}

        {!loading && orders?.length === 0 && (
          <Card className="mt-5">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">You have not ordered anything yet.</p>
              <Button asChild className="mt-4">
                <Link to={routes.products}>Browse the shop</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-5 space-y-5">
          {orders?.map(({ order, items }) => (
            <OrderSummary
              key={order.id}
              reference={order.reference}
              status={order.status}
              placedAt={order.created_at}
              items={items.map((item) => ({
                productTitle: item.product_title,
                variantName: item.variant_name,
                quantity: item.quantity,
                lineTotal: item.line_total,
              }))}
              subtotal={order.subtotal}
              deliveryFee={order.delivery_fee}
              total={order.total}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
