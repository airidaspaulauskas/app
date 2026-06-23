import { describe, expect, it } from "vitest";
import { z } from "zod";

import { extractJson } from "./json";

const schema = z.object({ a: z.number(), b: z.string() });

describe("extractJson", () => {
  it("parses a plain JSON object", () => {
    expect(extractJson('{"a":1,"b":"x"}', schema)).toEqual({ a: 1, b: "x" });
  });

  it("strips Markdown code fences", () => {
    expect(extractJson('```json\n{"a":2,"b":"y"}\n```', schema)).toEqual({
      a: 2,
      b: "y",
    });
  });

  it("recovers JSON wrapped in prose", () => {
    expect(
      extractJson('Sure! {"a":3,"b":"z"} — hope that helps', schema),
    ).toEqual({ a: 3, b: "z" });
  });

  it("parses top-level arrays", () => {
    expect(extractJson("[1, 2, 3]", z.array(z.number()))).toEqual([1, 2, 3]);
  });

  it("returns null for non-JSON", () => {
    expect(extractJson("not json at all", schema)).toBeNull();
  });

  it("returns null when JSON is valid but the schema doesn't match", () => {
    expect(extractJson('{"a":"nope"}', schema)).toBeNull();
  });
});
