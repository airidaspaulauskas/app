import { CalendarClock, Layers, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCents } from "@/lib/subscriptions/format";
import type { DashboardSummary } from "@/lib/subscriptions/summary";

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly spend
          </CardTitle>
          <Wallet className="h-4 w-4 text-brand" />
        </CardHeader>
        <CardContent>
          <div className="font-serif text-4xl font-semibold tabular-nums">
            {formatCents(summary.totalMonthlyCents)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            across {summary.count}{" "}
            {summary.count === 1 ? "subscription" : "subscriptions"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Annualized
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-serif text-4xl font-semibold tabular-nums">
            {formatCents(summary.totalAnnualCents)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            projected over 12 months
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active subscriptions
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-serif text-4xl font-semibold tabular-nums">
            {summary.count}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.byCategory.length}{" "}
            {summary.byCategory.length === 1 ? "category" : "categories"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
