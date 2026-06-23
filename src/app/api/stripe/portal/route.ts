import { NextResponse } from "next/server";

import { getOptionalUser, getOrCreateProfile } from "@/lib/auth/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

/** Create a Stripe Billing Portal session so a customer can manage/cancel. */
export async function POST() {
  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { supabase, user } = auth;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing isn't configured on this server." },
      { status: 503 },
    );
  }

  const profile = await getOrCreateProfile(supabase, user);
  if (!profile.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal failed", error);
    return NextResponse.json(
      { error: "Couldn't open the billing portal. Try again." },
      { status: 502 },
    );
  }
}
