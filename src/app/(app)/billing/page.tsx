import { requireUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="text-muted-foreground">
          You&apos;re currently on the{" "}
          <span className="font-medium capitalize text-foreground">
            {profile.plan_tier}
          </span>{" "}
          plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plans &amp; checkout arrive in Milestone 5</CardTitle>
          <CardDescription>
            Free vs. Pro tiers, Stripe Checkout, and the feature gate are wired
            up here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The Free plan covers up to 5 subscriptions; Pro unlocks unlimited
          subscriptions and the AI insights panel.
        </CardContent>
      </Card>
    </div>
  );
}
