import "server-only";

import Stripe from "stripe";

/** True when the keys needed to run Checkout are present. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID,
  );
}

let cached: Stripe | null = null;

/** Lazily-constructed Stripe client. Server-only — uses the secret key. */
export function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!cached) {
    cached = new Stripe(apiKey, { typescript: true });
  }
  return cached;
}
