"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { FREE_PLAN_SUBSCRIPTION_LIMIT } from "@/config/app";
import { requireUser } from "@/lib/auth/session";
import { subscriptionInputSchema } from "./schema";

export type MutationResult = { ok: true } | { ok: false; error: string };

const idSchema = z.string().uuid();

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

/** Creates a subscription for the current user, enforcing the free-plan cap. */
export async function createSubscription(input: unknown): Promise<MutationResult> {
  const parsed = subscriptionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const { supabase, user, profile } = await requireUser();

  if (profile.plan_tier === "free") {
    const { count, error: countError } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return { ok: false, error: "Couldn't verify your plan limit. Try again." };
    }
    if ((count ?? 0) >= FREE_PLAN_SUBSCRIPTION_LIMIT) {
      return {
        ok: false,
        error: `The Free plan is limited to ${FREE_PLAN_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to Pro for unlimited.`,
      };
    }
  }

  const values = parsed.data;
  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    name: values.name,
    category: values.category,
    cost_cents: values.costCents,
    billing_cycle: values.billingCycle,
    renewal_date: values.renewalDate ?? null,
    last_used: values.lastUsed,
    notes: values.notes ?? null,
  });

  if (error) return { ok: false, error: "Couldn't save the subscription. Try again." };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Updates one of the current user's subscriptions. */
export async function updateSubscription(
  id: string,
  input: unknown,
): Promise<MutationResult> {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid subscription." };
  }
  const parsed = subscriptionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const { supabase, user } = await requireUser();
  const values = parsed.data;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      name: values.name,
      category: values.category,
      cost_cents: values.costCents,
      billing_cycle: values.billingCycle,
      renewal_date: values.renewalDate ?? null,
      last_used: values.lastUsed,
      notes: values.notes ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Couldn't update the subscription. Try again." };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Deletes one of the current user's subscriptions. */
export async function deleteSubscription(id: string): Promise<MutationResult> {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid subscription." };
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Couldn't delete the subscription. Try again." };

  revalidatePath("/dashboard");
  return { ok: true };
}
