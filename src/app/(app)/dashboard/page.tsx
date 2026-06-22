import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getSubscriptions } from "@/lib/subscriptions/queries";
import { summarize } from "@/lib/subscriptions/summary";
import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button";
import { EmptySubscriptions } from "@/components/subscriptions/empty-subscriptions";
import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-table";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UpcomingRenewals } from "@/components/dashboard/upcoming-renewals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();
  if (!profile.onboarded) redirect("/onboarding");

  const subscriptions = await getSubscriptions(supabase, user.id);
  const summary = summarize(subscriptions);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Everything you&apos;re paying for, in one place.
          </p>
        </div>
        {subscriptions.length > 0 && <AddSubscriptionButton />}
      </header>

      {subscriptions.length === 0 ? (
        <EmptySubscriptions />
      ) : (
        <div className="space-y-6">
          <DashboardStats summary={summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spend by category</CardTitle>
                <CardDescription>
                  Where your monthly money goes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDonut
                  data={summary.byCategory}
                  totalMonthlyCents={summary.totalMonthlyCents}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming renewals</CardTitle>
                <CardDescription>Next 30 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingRenewals renewals={summary.upcomingRenewals} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                {summary.count} total · sortable by any column.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <SubscriptionsTable subscriptions={subscriptions} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
