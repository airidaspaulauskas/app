import "server-only";

import {
  SUBSCRIPTION_CATEGORIES,
  type BillingCycle,
  type SubscriptionCategory,
} from "@/config/app";
import { AI_MODEL, getAnthropic } from "./client";
import { extractJson } from "./json";
import { smartPasteResultSchema } from "./schemas";
import type { SmartPasteResult } from "./types";

function normalizeCategory(value: string): SubscriptionCategory {
  const match = SUBSCRIPTION_CATEGORIES.find(
    (category) => category.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? "Other";
}

function normalizeBillingCycle(value: string): BillingCycle {
  const v = value.trim().toLowerCase();
  return v.startsWith("ann") || v.includes("year") ? "annual" : "monthly";
}

const SYSTEM_PROMPT = `You extract a single SaaS / software / streaming subscription from free text or a pasted receipt.
Return ONLY a JSON object (no prose, no Markdown fences) with exactly these keys:
- "name": string — the product/service name (e.g. "ChatGPT Plus").
- "category": one of ${SUBSCRIPTION_CATEGORIES.map((c) => `"${c}"`).join(", ")}.
- "costUsd": number — the recurring price in US dollars (e.g. 20 or 19.99).
- "billingCycle": "monthly" or "annual".
- "renewalDate": "YYYY-MM-DD", or null if not present in the text.
- "notes": a short string, or null.
Use your best guess when a value is implied. For category, choose the closest match or "Other". Never invent a renewal date — use null if it isn't in the text.`;

/**
 * Parse free text or a receipt into structured subscription fields. Returns
 * `null` on unparseable output so the caller can show a friendly error. The
 * result is always confirmed by the user in the add form — never auto-saved.
 */
export async function parseSubscriptionText(
  text: string,
): Promise<SmartPasteResult | null> {
  const anthropic = getAnthropic();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text.slice(0, 6000) }],
  });

  const raw = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = extractJson(raw, smartPasteResultSchema);
  if (!parsed) return null;

  return {
    name: parsed.name.trim().slice(0, 120),
    category: normalizeCategory(parsed.category),
    costUsd: parsed.costUsd,
    billingCycle: normalizeBillingCycle(parsed.billingCycle),
    renewalDate: parsed.renewalDate ?? null,
    notes: parsed.notes?.trim() ? parsed.notes.trim().slice(0, 2000) : null,
  };
}
