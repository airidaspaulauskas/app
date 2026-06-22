import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireUser();
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your total spend, renewals, and AI savings recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions &amp; charts land in Milestone 3</CardTitle>
          <CardDescription>
            Auth, the database schema, RLS, and onboarding are wired up. Total
            monthly burn, the category donut, upcoming renewals, and the
            subscriptions table arrive next.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You&apos;re signed in and onboarded — RLS guarantees you only ever see
          your own data.
        </CardContent>
      </Card>
    </div>
  );
}
