import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/components/price-display";
import { appConfig } from "@/config/app-config";

/**
 * Read-only on purpose.
 *
 * Everything shown here comes from files the platform owns —
 * `brand.generated.json` is written when a project is branded, and
 * `site-content.json` is edited through the builder rather than by hand. A form
 * here would create a second source of truth that the next build overwrites.
 */
export default function SettingsPage() {
  const rows = [
    { label: "Shop name", value: appConfig.name },
    { label: "Tagline", value: appConfig.tagline },
    { label: "Currency", value: appConfig.currency },
    { label: "Locale", value: appConfig.locale },
    { label: "Delivery fee", value: formatMoney(appConfig.deliveryFee) },
    { label: "Free delivery over", value: formatMoney(appConfig.freeDeliveryOver) },
    { label: "Low stock threshold", value: `${appConfig.lowStockThreshold} units` },
    { label: "Payment", value: "Cash on delivery only" },
  ];

  return (
    <div data-builder-id="dashboard.settings">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="text-muted-foreground mt-2">How this shop is configured.</p>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="p-6">
          <dl className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
                {index < rows.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </dl>

          <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
            Branding lives in <code>client/src/config/brand.generated.json</code> and navigation copy in{" "}
            <code>client/src/config/site-content.json</code>. Both are edited through the builder, so changes
            made here by hand would be overwritten on the next build.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
