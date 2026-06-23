import { z } from "zod";

/**
 * Schemas for the *raw* model output (dollars, lenient enums). We normalize and
 * convert to the stored shapes (`@/lib/ai/types`) after validation.
 */

export const smartPasteResultSchema = z.object({
  name: z.string().trim().min(1).max(120),
  // Lenient — normalized against the allowed category list after parsing.
  category: z.string(),
  costUsd: z.number().nonnegative().max(1_000_000),
  // Lenient — normalized to "monthly" | "annual" after parsing.
  billingCycle: z.string(),
  renewalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const aiInsightCardSchema = z.object({
  kind: z.enum(["overlap", "unused", "cut"]),
  headline: z.string().trim().min(1).max(160),
  reason: z.string().trim().min(1).max(280),
  monthlySavingsUsd: z.number().nonnegative().max(1_000_000),
  subscriptions: z.array(z.string().trim().min(1)).max(12).default([]),
});

export const aiInsightsSchema = z.object({
  totalPotentialMonthlySavingsUsd: z.number().nonnegative().max(1_000_000),
  headline: z.string().trim().min(1).max(200),
  cards: z.array(aiInsightCardSchema).max(15).default([]),
});

export type AiInsights = z.infer<typeof aiInsightsSchema>;
