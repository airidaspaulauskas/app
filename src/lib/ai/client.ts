import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/**
 * AI model id. Centralized so it's a one-line change. Per the product spec we
 * use Claude Sonnet 4.6 — a current model with a large context window and
 * structured-output support, called only from server-side route handlers.
 */
export const AI_MODEL = "claude-sonnet-4-6";

/** True when the Anthropic key is present. Lets routes degrade gracefully. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let cached: Anthropic | null = null;

/** Lazily-constructed Anthropic client. Server-only — never import into client code. */
export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  if (!cached) {
    cached = new Anthropic({ apiKey });
  }
  return cached;
}
