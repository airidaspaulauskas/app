import { format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatMonthly, monthlyCents } from "@/lib/subscriptions/format";
import type { UpcomingRenewal } from "@/lib/subscriptions/summary";

function relativeLabel(daysUntil: number): string {
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `${daysUntil}d`;
}

export function UpcomingRenewals({
  renewals,
}: {
  renewals: UpcomingRenewal[];
}) {
  if (renewals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <CalendarClock className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nothing renews in the next 30 days.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {renewals.map(({ subscription, daysUntil }) => (
        <li
          key={subscription.id}
          className="flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{subscription.name}</p>
            <p className="text-xs text-muted-foreground">
              {subscription.renewal_date
                ? format(parseISO(subscription.renewal_date), "MMM d")
                : ""}{" "}
              · {formatMonthly(monthlyCents(subscription))}
            </p>
          </div>
          <Badge variant={daysUntil <= 7 ? "warning" : "secondary"}>
            {relativeLabel(daysUntil)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
