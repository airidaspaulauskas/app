import { z } from "zod";

import type { BillingCycle, SubscriptionCategory } from "@/config/app";

/**
 * Result of smart-paste parsing (dollars, as the model returns). Lives here —
 * not in the `server-only` parser module — so client components can import the
 * type without pulling server code into the bundle.
 */
export type SmartPasteResult = {
  name: string;
  category: SubscriptionCategory;
  costUsd: number;
  billingCycle: BillingCycle;
  renewalDate: string | null;
  notes: string | null;
};

export const INSIGHT_KINDS = ["overlap", "unused", "cut"] as const;
export type InsightKind = (typeof INSIGHT_KINDS)[number];

/**
 * Stored insight shape (cents-based, with stable ids). This is what we cache in
 * the `insights` table and validate defensively when reading back.
 */
export const insightCardSchema = z.object({
  id: z.string(),
  kind: z.enum(INSIGHT_KINDS),
  headline: z.string(),
  reason: z.string(),
  monthlySavingsCents: z.number().int().nonnegative(),
  subscriptions: z.array(z.string()),
});
export type InsightCard = z.infer<typeof insightCardSchema>;

export const insightsPayloadSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string(),
  totalPotentialMonthlySavingsCents: z.number().int().nonnegative(),
  headline: z.string(),
  cards: z.array(insightCardSchema),
});
export type InsightsPayload = z.infer<typeof insightsPayloadSchema>;
