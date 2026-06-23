import { describe, expect, it } from "vitest";

import {
  annualCents,
  formatAnnual,
  formatCents,
  formatMonthly,
  formatMonthlyAndAnnual,
  monthlyCents,
} from "./format";

describe("monthlyCents", () => {
  it("returns the cost as-is for monthly billing", () => {
    expect(monthlyCents({ cost_cents: 1200, billing_cycle: "monthly" })).toBe(1200);
  });

  it("divides annual cost by 12", () => {
    expect(monthlyCents({ cost_cents: 12000, billing_cycle: "annual" })).toBe(1000);
  });

  it("rounds annual cost to the nearest cent", () => {
    // 10000 / 12 = 833.33…
    expect(monthlyCents({ cost_cents: 10000, billing_cycle: "annual" })).toBe(833);
  });
});

describe("annualCents", () => {
  it("multiplies monthly cost by 12", () => {
    expect(annualCents({ cost_cents: 2000, billing_cycle: "monthly" })).toBe(24000);
  });

  it("returns the cost as-is for annual billing", () => {
    expect(annualCents({ cost_cents: 12000, billing_cycle: "annual" })).toBe(12000);
  });
});

describe("formatCents", () => {
  it("omits decimals for whole dollars", () => {
    expect(formatCents(2000)).toBe("$20");
    expect(formatCents(0)).toBe("$0");
    expect(formatCents(152400)).toBe("$1,524");
  });

  it("shows cents for fractional dollars", () => {
    expect(formatCents(2050)).toBe("$20.50");
    expect(formatCents(833)).toBe("$8.33");
    expect(formatCents(152499)).toBe("$1,524.99");
  });
});

describe("formatted strings", () => {
  it("formats monthly and annual suffixes", () => {
    expect(formatMonthly(2000)).toBe("$20/mo");
    expect(formatAnnual(24000)).toBe("$240/yr");
  });

  it("combines monthly and annualized figures", () => {
    expect(formatMonthlyAndAnnual(2000)).toBe("$20/mo · $240/yr");
  });
});
