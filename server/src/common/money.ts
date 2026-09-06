/**
 * Money helpers.
 *
 * Prices are `numeric(10,2)` read in `mode: "number"`, so they arrive as
 * ordinary numbers. Multiplying a price by a quantity still produces binary
 * float noise — 19.99 * 3 is 59.97000000000001 — which would be stored and
 * then shown to a customer. Every computed total goes through `round2`.
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Line total for a quantity at a unit price. */
export function lineTotal(unitPrice: number, quantity: number): number {
  return round2(unitPrice * quantity);
}

/** Sum of already-rounded amounts, rounded once more against accumulation drift. */
export function sum(amounts: number[]): number {
  return round2(amounts.reduce((total, amount) => total + amount, 0));
}
