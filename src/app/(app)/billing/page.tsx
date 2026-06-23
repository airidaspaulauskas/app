import { Check, Sparkles } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { isStripeConfigured } from "@/lib/stripe/client";
import { FREE_PLAN_SUBSCRIPTION_LIMIT } from "@/config/app";
import { cn } from "@/lib/utils";
import { BillingActions } from "@/components/billing/billing-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Billing" };

const FREE_FEATURES = [
  `Up to ${FREE_PLAN_SUBSCRIPTION_LIMIT} subscriptions`,
  "Spend dashboard & category breakdown",
  "Renewal reminders",
  "Smart paste add",
];

const PRO_FEATURES = [
  "Unlimited subscriptions",
  "AI insights: overlap, unused & cut-list",
  "Quantified monthly savings",
  "Everything in Free",
];

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { profile } = await requireUser();
  const isPro = profile.plan_tier === "pro";
  const stripeReady = isStripeConfigured();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="text-muted-foreground">
          You&apos;re on the{" "}
          <span className="font-medium capitalize text-foreground">
            {profile.plan_tier}
          </span>{" "}
          plan.
        </p>
      </div>

      {searchParams.status === "success" && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
          <p className="font-medium text-success">Payment received 🎉</p>
          <p className="text-muted-foreground">
            Your Pro features unlock within a few seconds — refresh if you don&apos;t
            see them yet.
          </p>
        </div>
      )}
      {searchParams.status === "cancelled" && (
        <div className="rounded-lg border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Checkout cancelled — no charge was made.
        </div>
      )}
      {!stripeReady && (
        <div className="rounded-lg border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Billing isn&apos;t configured on this server yet. Add your Stripe test
          keys to <code className="font-mono">.env.local</code> to enable
          checkout.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={cn(!isPro && "border-foreground/20")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              {!isPro && <Badge variant="secondary">Current</Badge>}
            </div>
            <CardDescription>
              <span className="font-serif text-3xl font-semibold text-foreground">
                $0
              </span>{" "}
              / month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList features={FREE_FEATURES} />
          </CardContent>
        </Card>

        <Card className={cn(isPro ? "border-brand/40" : "border-brand/30")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand" />
                Pro
              </CardTitle>
              {isPro && <Badge variant="brand">Current</Badge>}
            </div>
            <CardDescription>
              Unlock unlimited subscriptions and AI insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FeatureList features={PRO_FEATURES} />
            <BillingActions planTier={profile.plan_tier} disabled={!stripeReady} />
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Test mode — use Stripe&apos;s test card 4242 4242 4242 4242 with any
        future expiry and CVC.
      </p>
    </div>
  );
}
