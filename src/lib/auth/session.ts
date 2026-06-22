import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

type SupabaseServerClient = ReturnType<typeof createClient>;

/**
 * Loads the caller's profile, creating it defensively if the sign-up trigger
 * hasn't (RLS allows a user to insert only their own profile row).
 */
export async function getOrCreateProfile(
  supabase: SupabaseServerClient,
  user: User,
): Promise<ProfileRow> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email ?? "" })
    .select("*")
    .single();

  if (error) throw error;
  return created;
}

export type AuthedContext = {
  supabase: SupabaseServerClient;
  user: User;
  profile: ProfileRow;
};

/**
 * Server-side guard for authenticated routes. Redirects to /login when there
 * is no session; otherwise returns the Supabase client, user, and profile.
 */
export async function requireUser(): Promise<AuthedContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(supabase, user);
  return { supabase, user, profile };
}
