import type { z } from "zod";

/**
 * Strip Markdown code fences and any surrounding prose, returning the most
 * likely JSON substring. Defensive: models occasionally wrap JSON in ```json
 * fences or add a sentence before/after despite instructions.
 */
function stripToJson(raw: string): string {
  let text = raw.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    text = fenced[1].trim();
  }

  const firstBrace = text.search(/[[{]/);
  const lastBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

/**
 * Parse a model's text response into a validated object, or `null` if it can't
 * be parsed/validated. Callers render a fallback UI on `null`. Keyed off
 * `z.infer<S>` so schema defaults are reflected in the returned (output) type.
 */
export function extractJson<S extends z.ZodTypeAny>(
  raw: string,
  schema: S,
): z.infer<S> | null {
  try {
    const parsed: unknown = JSON.parse(stripToJson(raw));
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
