import { differenceInCalendarDays, parseISO } from "date-fns";

import type { SubscriptionCategory } from "@/config/app";
import type { SubscriptionRow } from "@/types/database";
import { monthlyCents } from "./format";

export const RENEWAL_WINDOW_DAYS = 30;

export type CategoryDatum = {
  category: SubscriptionCategory;
  monthlyCents: number;
  count: number;
};

export type UpcomingRenewal = {
  subscription: SubscriptionRow;
  daysUntil: number;
};

export type DashboardSummary = {
  count: number;
  totalMonthlyCents: number;
  totalAnnualCents: number;
  byCategory: CategoryDatum[];
  upcomingRenewals: UpcomingRenewal[];
};

/**
 * Pure aggregation of a user's subscriptions into the numbers the dashboard
 * renders. Annual costs are normalized to monthly first, so every total is
 * apples-to-apples.
 */
export function summarize(
  subscriptions: SubscriptionRow[],
  now: Date = new Date(),
): DashboardSummary {
  let totalMonthlyCents = 0;
  const categoryMap = new Map<SubscriptionCategory, CategoryDatum>();
  const upcomingRenewals: UpcomingRenewal[] = [];

  for (const subscription of subscriptions) {
    const monthly = monthlyCents(subscription);
    totalMonthlyCents += monthly;

    const existing = categoryMap.get(subscription.category);
    if (existing) {
      existing.monthlyCents += monthly;
      existing.count += 1;
    } else {
      categoryMap.set(subscription.category, {
        category: subscription.category,
        monthlyCents: monthly,
        count: 1,
      });
    }

    if (subscription.renewal_date) {
      const daysUntil = differenceInCalendarDays(
        parseISO(subscription.renewal_date),
        now,
      );
      if (daysUntil >= 0 && daysUntil <= RENEWAL_WINDOW_DAYS) {
        upcomingRenewals.push({ subscription, daysUntil });
      }
    }
  }

  upcomingRenewals.sort((a, b) => a.daysUntil - b.daysUntil);
  const byCategory = [...categoryMap.values()].sort(
    (a, b) => b.monthlyCents - a.monthlyCents,
  );

  return {
    count: subscriptions.length,
    totalMonthlyCents,
    totalAnnualCents: totalMonthlyCents * 12,
    byCategory,
    upcomingRenewals,
  };
}
