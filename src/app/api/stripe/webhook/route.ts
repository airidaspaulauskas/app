import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";
import type { PlanTier } from "@/config/app";

/**
 * Stripe webhook. Minimal by design — only what's needed to flip a user's plan
 * tier. Uses the service-role client because the request isn't authenticated as
 * the user. The raw body is required for signature verification.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook isn't configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const service = createServiceClient();
  const customerId = (value: string | Stripe.Customer | Stripe.DeletedCustomer | null) =>
    typeof value === "string" ? value : (value?.id ?? null);

  async function setTierByCustomer(id: string | null, tier: PlanTier) {
    if (!id) return;
    await service.from("profiles").update({ plan_tier: tier }).eq("stripe_customer_id", id);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId =
        session.metadata?.supabase_user_id ?? session.client_reference_id ?? null;
      const id = customerId(session.customer);
      if (userId) {
        await service
          .from("profiles")
          .update({
            plan_tier: "pro",
            ...(id ? { stripe_customer_id: id } : {}),
          })
          .eq("id", userId);
      } else {
        await setTierByCustomer(id, "pro");
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const active =
        subscription.status === "active" || subscription.status === "trialing";
      await setTierByCustomer(customerId(subscription.customer), active ? "pro" : "free");
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await setTierByCustomer(customerId(subscription.customer), "free");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
