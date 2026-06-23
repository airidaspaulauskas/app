import { describe, expect, it } from "vitest";

import { categoryColorVar } from "./categories";

describe("categoryColorVar", () => {
  it("maps each category to a stable themed chart variable", () => {
    expect(categoryColorVar("AI")).toBe("hsl(var(--chart-1))");
    expect(categoryColorVar("Streaming")).toBe("hsl(var(--chart-4))");
    expect(categoryColorVar("Other")).toBe("hsl(var(--chart-7))");
  });
});
