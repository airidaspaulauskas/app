import { describe, expect, it } from "vitest";

import type { SubscriptionRow } from "@/types/database";
import { summarize } from "./summary";

function sub(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    user_id: "u1",
    name: "Sub",
    category: "AI",
    cost_cents: 1000,
    billing_cycle: "monthly",
    renewal_date: null,
    last_used: "unknown",
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("summarize", () => {
  it("returns zeros for an empty list", () => {
    const s = summarize([]);
    expect(s.count).toBe(0);
    expect(s.totalMonthlyCents).toBe(0);
    expect(s.totalAnnualCents).toBe(0);
    expect(s.byCategory).toEqual([]);
    expect(s.upcomingRenewals).toEqual([]);
  });

  it("totals monthly + annualized spend with annual normalization", () => {
    const s = summarize([
      sub({ category: "AI", cost_cents: 2000, billing_cycle: "monthly" }),
      sub({ category: "AI", cost_cents: 1000, billing_cycle: "monthly" }),
      sub({ category: "Productivity", cost_cents: 12000, billing_cycle: "annual" }),
    ]);
    expect(s.count).toBe(3);
    expect(s.totalMonthlyCents).toBe(4000); // 2000 + 1000 + (12000/12)
    expect(s.totalAnnualCents).toBe(48000); // 4000 * 12
  });

  it("groups by category and sorts by monthly spend desc", () => {
    const s = summarize([
      sub({ category: "AI", cost_cents: 2000 }),
      sub({ category: "AI", cost_cents: 1000 }),
      sub({ category: "Productivity", cost_cents: 1000 }),
    ]);
    expect(s.byCategory).toEqual([
      { category: "AI", monthlyCents: 3000, count: 2 },
      { category: "Productivity", monthlyCents: 1000, count: 1 },
    ]);
  });

  it("includes only renewals within 30 days, soonest first", () => {
    const now = new Date("2026-06-23T00:00:00Z");
    const s = summarize(
      [
        sub({ name: "Soon", renewal_date: "2026-07-03" }), // +10 days
        sub({ name: "Later", renewal_date: "2026-07-13" }), // +20 days
        sub({ name: "FarOut", renewal_date: "2026-08-07" }), // +45 days (excluded)
        sub({ name: "Past", renewal_date: "2026-06-18" }), // -5 days (excluded)
        sub({ name: "NoDate", renewal_date: null }), // excluded
      ],
      now,
    );

    expect(s.upcomingRenewals.map((r) => r.subscription.name)).toEqual([
      "Soon",
      "Later",
    ]);
    expect(s.upcomingRenewals.map((r) => r.daysUntil)).toEqual([10, 20]);
  });
});
