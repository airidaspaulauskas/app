"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";

/** Marks onboarding complete and sends the user to their dashboard. */
export async function completeOnboarding(): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
