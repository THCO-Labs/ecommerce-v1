import { appConfig } from "@/config/app-config";
import { cn } from "@/lib/utils";

const formatter = new Intl.NumberFormat(appConfig.locale, {
  style: "currency",
  currency: appConfig.currency,
});

/** The one place an amount becomes text, so no screen invents its own format. */
export function formatMoney(amount: number): string {
  return formatter.format(amount);
}

const compactFormatter = new Intl.NumberFormat(appConfig.locale, {
  style: "currency",
  currency: appConfig.currency,
  maximumFractionDigits: 0,
});

/**
 * The same amount without trailing pence, for prose rather than price tags.
 * "Orders over £50 arrive free" reads; "over £50.00" does not. Amounts that
 * are not whole keep their pence, because rounding them would be a lie.
 */
export function formatMoneyCompact(amount: number): string {
  return Number.isInteger(amount) ? compactFormatter.format(amount) : formatter.format(amount);
}

interface PriceDisplayProps {
  amount: number;
  /** Prefixes "from", for a product whose variants are priced differently. */
  from?: boolean;
  className?: string;
}

export function PriceDisplay({ amount, from = false, className }: PriceDisplayProps) {
  return (
    <span className={cn("tabular font-semibold", className)}>
      {from && <span className="text-muted-foreground mr-1 text-xs font-normal">from</span>}
      {formatMoney(amount)}
    </span>
  );
}
