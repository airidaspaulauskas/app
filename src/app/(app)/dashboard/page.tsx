import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
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
          <CardTitle>Coming in Milestone 3</CardTitle>
          <CardDescription>
            Total monthly burn, annualized spend, a spend-by-category donut,
            upcoming renewals, and a sortable subscriptions table land here. This
            scaffold confirms routing, theming, and the app shell are wired up.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Auth, the database schema, and onboarding are built in Milestone 2.
        </CardContent>
      </Card>
    </div>
  );
}
