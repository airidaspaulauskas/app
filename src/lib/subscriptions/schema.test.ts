import { describe, expect, it } from "vitest";

import { subscriptionInputSchema } from "./schema";

const valid = {
  name: "ChatGPT Plus",
  category: "AI",
  costCents: 2000,
  billingCycle: "monthly",
  renewalDate: null,
  lastUsed: "today",
  notes: null,
};

describe("subscriptionInputSchema", () => {
  it("accepts a valid subscription", () => {
    expect(subscriptionInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(subscriptionInputSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });

  it("rejects negative or non-integer costs", () => {
    expect(
      subscriptionInputSchema.safeParse({ ...valid, costCents: -1 }).success,
    ).toBe(false);
    expect(
      subscriptionInputSchema.safeParse({ ...valid, costCents: 19.99 }).success,
    ).toBe(false);
  });

  it("rejects unknown enum values", () => {
    expect(
      subscriptionInputSchema.safeParse({ ...valid, category: "Music" }).success,
    ).toBe(false);
    expect(
      subscriptionInputSchema.safeParse({ ...valid, billingCycle: "weekly" })
        .success,
    ).toBe(false);
    expect(
      subscriptionInputSchema.safeParse({ ...valid, lastUsed: "yesterday" })
        .success,
    ).toBe(false);
  });

  it("validates the renewal date format and allows it to be absent", () => {
    expect(
      subscriptionInputSchema.safeParse({ ...valid, renewalDate: "03/03/2026" })
        .success,
    ).toBe(false);
    expect(
      subscriptionInputSchema.safeParse({ ...valid, renewalDate: "2026-03-03" })
        .success,
    ).toBe(true);

    const withoutDate = {
      name: valid.name,
      category: valid.category,
      costCents: valid.costCents,
      billingCycle: valid.billingCycle,
      lastUsed: valid.lastUsed,
      notes: valid.notes,
    };
    expect(subscriptionInputSchema.safeParse(withoutDate).success).toBe(true);
  });
});
