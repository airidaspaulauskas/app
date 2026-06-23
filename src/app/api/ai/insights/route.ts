import { NextResponse } from "next/server";

import { isAiConfigured } from "@/lib/ai/client";
import { generateInsights } from "@/lib/ai/insights";
import { getOptionalUser, getOrCreateProfile } from "@/lib/auth/session";
import { saveInsights } from "@/lib/insights/queries";
import { getSubscriptions } from "@/lib/subscriptions/queries";

/** Regenerate and cache AI insights. Pro-gated; requires ≥2 subscriptions. */
export async function POST() {
  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { supabase, user } = auth;

  const profile = await getOrCreateProfile(supabase, user);
  if (profile.plan_tier !== "pro") {
    return NextResponse.json(
      { error: "AI insights are a Pro feature." },
      { status: 403 },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI isn't configured on this server." },
      { status: 503 },
    );
  }

  const subscriptions = await getSubscriptions(supabase, user.id);
  if (subscriptions.length < 2) {
    return NextResponse.json(
      { error: "Add at least 2 subscriptions to get insights." },
      { status: 400 },
    );
  }

  try {
    const payload = await generateInsights(subscriptions);
    await saveInsights(supabase, user.id, payload);
    return NextResponse.json({ payload });
  } catch (error) {
    console.error("insights generation failed", error);
    return NextResponse.json(
      { error: "The AI request failed. Try again." },
      { status: 502 },
    );
  }
}
