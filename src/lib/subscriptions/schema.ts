import { z } from "zod";

import {
  BILLING_CYCLES,
  LAST_USED_OPTIONS,
  SUBSCRIPTION_CATEGORIES,
  type BillingCycle,
  type LastUsedValue,
  type SubscriptionCategory,
} from "@/config/app";

const categoryEnum = z.enum(
  SUBSCRIPTION_CATEGORIES as unknown as [
    SubscriptionCategory,
    ...SubscriptionCategory[],
  ],
);

const billingCycleEnum = z.enum(
  BILLING_CYCLES as unknown as [BillingCycle, ...BillingCycle[]],
);

const lastUsedEnum = z.enum(
  LAST_USED_OPTIONS.map((option) => option.value) as unknown as [
    LastUsedValue,
    ...LastUsedValue[],
  ],
);

/**
 * Canonical subscription input validated at every boundary: the client form
 * checks it for UX, and the server actions re-check it for safety. `costCents`
 * is an integer count of cents; the form converts the dollar input before
 * calling the action.
 */
export const subscriptionInputSchema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(120, "Name is too long"),
  category: categoryEnum,
  costCents: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .int("Enter a valid amount")
    .min(0, "Cost can't be negative")
    .max(100_000_000, "That seems too high"),
  billingCycle: billingCycleEnum,
  renewalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .nullable()
    .optional(),
  lastUsed: lastUsedEnum,
  notes: z.string().trim().max(2000, "Notes are too long").nullable().optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;
