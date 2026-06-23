import type { SupabaseClient } from "@supabase/supabase-js";

import { insightsPayloadSchema, type InsightsPayload } from "@/lib/ai/types";
import type { Database, Json } from "@/types/database";

/**
 * Read the most recent cached insights for a user, validated defensively. A
 * payload that doesn't match the current schema (e.g. an older version) is
 * treated as absent rather than crashing the dashboard.
 */
export async function getLatestInsights(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<InsightsPayload | null> {
  const { data, error } = await supabase
    .from("insights")
    .select("payload")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const parsed = insightsPayloadSchema.safeParse(data.payload);
  return parsed.success ? parsed.data : null;
}

/** Replace any cached insights for a user with a freshly generated payload. */
export async function saveInsights(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: InsightsPayload,
): Promise<void> {
  await supabase.from("insights").delete().eq("user_id", userId);
  await supabase.from("insights").insert({
    user_id: userId,
    payload: payload as unknown as Json,
    generated_at: payload.generatedAt,
  });
}
