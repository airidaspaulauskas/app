import type { BillingCycle } from "@/config/app";

type CostLike = { cost_cents: number; billing_cycle: BillingCycle };

const usdWithCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Cost normalized to cents per month, regardless of billing cycle. */
export function monthlyCents(input: CostLike): number {
  return input.billing_cycle === "annual"
    ? Math.round(input.cost_cents / 12)
    : input.cost_cents;
}

/** Cost normalized to cents per year. */
export function annualCents(input: CostLike): number {
  return input.billing_cycle === "annual"
    ? input.cost_cents
    : input.cost_cents * 12;
}

/** Format a cent amount as USD. Whole-dollar values omit the decimals. */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars)
    ? usdWhole.format(dollars)
    : usdWithCents.format(dollars);
}

export function formatMonthly(cents: number): string {
  return `${formatCents(cents)}/mo`;
}

export function formatAnnual(cents: number): string {
  return `${formatCents(cents)}/yr`;
}

/** "$127/mo · $1,524/yr" — the canonical money string used across the app. */
export function formatMonthlyAndAnnual(monthly: number): string {
  return `${formatMonthly(monthly)} · ${formatAnnual(monthly * 12)}`;
}
