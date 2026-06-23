"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type SignInState = {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
};

/**
 * Sends a magic-link sign-in email. Returns state for the form to render
 * (success → "check your email", or a validation/transport error). Never
 * throws — a missing config or transport failure becomes a friendly message.
 */
export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid email.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Sign-in isn't available yet — the server is missing its Supabase configuration.",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
        email: parsed.data.email,
      };
    }

    return { status: "sent", email: parsed.data.email };
  } catch (error) {
    console.error("signInWithEmail failed", error);
    return {
      status: "error",
      message: "Couldn't send the sign-in link. Please try again.",
    };
  }
}

/** Signs the user out and returns them to the login page. */
export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
