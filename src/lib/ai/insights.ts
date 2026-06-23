import "server-only";

import { LAST_USED_OPTIONS } from "@/config/app";
import { monthlyCents } from "@/lib/subscriptions/format";
import type { SubscriptionRow } from "@/types/database";
import { AI_MODEL, getAnthropic } from "./client";
import { extractJson } from "./json";
import { aiInsightsSchema } from "./schemas";
import type { InsightCard, InsightsPayload } from "./types";

const LAST_USED_LABEL = new Map(
  LAST_USED_OPTIONS.map((option) => [option.value, option.label]),
);

const SYSTEM_PROMPT = `You are a subscription-cost analyst for an app called SubWise.
Given a user's subscriptions, find concrete ways to save money. Focus on:
1. Overlap — multiple tools doing largely the same job (e.g. ChatGPT + Claude + Gemini, or Notion + Evernote). The user likely needs only one.
2. Likely-unused — tools the user "can't remember" using, especially if expensive or renewing soon.
3. A ranked "cut these first" list — the specific subscriptions to cancel, highest-impact first.

Return ONLY a JSON object (no prose, no Markdown fences) with exactly:
- "totalPotentialMonthlySavingsUsd": number — realistic total monthly USD saved if the user acts on your top recommendations, WITHOUT double-counting.
- "headline": a short, confident one-line summary (e.g. "You could save about $47/month by cutting 3 tools").
- "cards": array (max 8) of objects, each with:
  - "kind": "overlap" | "unused" | "cut"
  - "headline": short title (e.g. "ChatGPT, Claude & Gemini overlap")
  - "reason": one sentence explaining why.
  - "monthlySavingsUsd": number — estimated monthly USD saved by acting on this card.
  - "subscriptions": array of the exact subscription names this card refers to.
All costs provided are already normalized to monthly USD. Reference real subscription names. If there's little to cut, say so honestly with low or zero savings.`;

function buildUserMessage(subscriptions: SubscriptionRow[]): string {
  const lines = subscriptions.map((sub) => {
    const monthlyUsd = (monthlyCents(sub) / 100).toFixed(2);
    const lastUsed = LAST_USED_LABEL.get(sub.last_used) ?? sub.last_used;
    const renews = sub.renewal_date ? ` | renews: ${sub.renewal_date}` : "";
    return `- ${sub.name} | category: ${sub.category} | $${monthlyUsd}/mo | billed ${sub.billing_cycle} | last used: ${lastUsed}${renews}`;
  });
  return `Here are my ${subscriptions.length} subscriptions:\n${lines.join("\n")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Generate the structured AI insights payload for a user's subscriptions.
 * Always returns a renderable payload — on parse failure it returns an empty
 * payload with an explanatory headline rather than throwing.
 */
export async function generateInsights(
  subscriptions: SubscriptionRow[],
): Promise<InsightsPayload> {
  const anthropic = getAnthropic();
  const generatedAt = new Date().toISOString();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(subscriptions) }],
  });

  const raw = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = extractJson(raw, aiInsightsSchema);

  if (!parsed) {
    return {
      version: 1,
      generatedAt,
      totalPotentialMonthlySavingsCents: 0,
      headline: "We couldn't analyze your subscriptions just now — try again.",
      cards: [],
    };
  }

  const cards: InsightCard[] = parsed.cards.map((card, index) => ({
    id: `${card.kind}:${slugify(card.headline) || index}`,
    kind: card.kind,
    headline: card.headline,
    reason: card.reason,
    monthlySavingsCents: Math.round(card.monthlySavingsUsd * 100),
    subscriptions: card.subscriptions,
  }));

  return {
    version: 1,
    generatedAt,
    totalPotentialMonthlySavingsCents: Math.round(
      parsed.totalPotentialMonthlySavingsUsd * 100,
    ),
    headline: parsed.headline,
    cards,
  };
}
