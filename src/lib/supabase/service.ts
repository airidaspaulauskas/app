import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. **Server-only** — bypasses Row Level Security
 * using the service-role key. Use this strictly for trusted server flows that
 * must act across users (e.g. the Stripe webhook flipping a user's plan tier).
 * Never import this into client code.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
