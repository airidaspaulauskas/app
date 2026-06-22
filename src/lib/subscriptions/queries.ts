import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, SubscriptionRow } from "@/types/database";

/**
 * Loads all of a user's subscriptions, newest first. RLS already restricts to
 * the caller's rows; the explicit `user_id` filter is defense-in-depth.
 */
export async function getSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SubscriptionRow[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
