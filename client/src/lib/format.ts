/**
 * Display formatting shared by the storefront and the dashboard.
 * Money lives in `components/price-display.tsx`, which owns the one currency
 * formatter; everything here is dependency-free so any layer can import it.
 */
import type { OrderStatus } from "@/types";

/** "14 Jun 2026" from a timestamptz. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "14 Jun 2026, 15:20" from a timestamptz. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "3 items" / "1 item". */
export function formatItems(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

/** Sentence case for a status enum, so screens never print PACKED at a customer. */
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  DISPATCHED: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function orderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** First-letter initials for avatar fallbacks. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
