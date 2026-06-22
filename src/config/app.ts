/**
 * Central app + domain configuration.
 *
 * Rename the entire product by changing `APP_NAME` — it is referenced
 * everywhere through this constant. Domain enums (categories, billing cycles,
 * "last used" buckets) also live here so the UI, Zod schemas, and AI prompts
 * all read from a single source of truth.
 */

export const APP_NAME = "SubWise";

export const APP_DESCRIPTION =
  "Find every AI tool and SaaS subscription you're paying for, surface the overlapping and unused ones, and see exactly what to cancel to save money.";

export const APP_TAGLINE = "Find every subscription you forgot you're paying for.";

/**
 * Free plan limits. The billing/feature gate (Milestone 5) reads from here so
 * the cap lives in exactly one place.
 */
export const FREE_PLAN_SUBSCRIPTION_LIMIT = 5;

/** Subscription categories — the fixed taxonomy used across the app. */
export const SUBSCRIPTION_CATEGORIES = [
  "AI",
  "Design",
  "Productivity",
  "Streaming",
  "Dev Tools",
  "Storage",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

/** Billing cycles. Annual costs are normalized to a monthly figure everywhere. */
export const BILLING_CYCLES = ["monthly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** Self-reported "last used" buckets. `unknown` ("can't remember") feeds the
 * likely-unused detection in the AI insights panel. */
export const LAST_USED_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "unknown", label: "Can't remember" },
] as const;

export type LastUsedValue = (typeof LAST_USED_OPTIONS)[number]["value"];

/** Plan tiers, mirrored in the `profiles.plan_tier` column. */
export const PLAN_TIERS = ["free", "pro"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];
