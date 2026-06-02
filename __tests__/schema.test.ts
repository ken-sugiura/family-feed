import { describe, it, expect } from "vitest";

import {
  childrenSchema,
  categoriesSchema,
  eventsSchema,
  workspaceSchema,
} from "@/lib/schema";

import childrenData from "@/data/children.json";
import categoriesData from "@/data/categories.json";
import eventsData from "@/data/events.json";
import workspaceData from "@/data/workspace.json";

describe("data/*.json schema validation", () => {
  it("data/children.json は childrenSchema を満たす", () => {
    const result = childrenSchema.safeParse(childrenData);
    expect(result.success).toBe(true);
  });

  it("data/categories.json は categoriesSchema を満たす", () => {
    const result = categoriesSchema.safeParse(categoriesData);
    expect(result.success).toBe(true);
  });

  it("data/events.json は eventsSchema を満たす", () => {
    const result = eventsSchema.safeParse(eventsData);
    expect(result.success).toBe(true);
  });

  it("data/workspace.json は workspaceSchema を満たす", () => {
    const result = workspaceSchema.safeParse(workspaceData);
    expect(result.success).toBe(true);
  });
});

describe("schema rejects invalid data", () => {
  it("childrenSchema は配列を期待する", () => {
    expect(childrenSchema.safeParse({}).success).toBe(false);
    expect(childrenSchema.safeParse(null).success).toBe(false);
  });

  it("familyEvent は date と caption が必須", () => {
    expect(
      eventsSchema.safeParse([
        { id: "x", childIds: [], categoryIds: [] },
      ]).success,
    ).toBe(false);
  });

  it("workspaceSchema は name と icon を要求する", () => {
    expect(workspaceSchema.safeParse({ name: "" }).success).toBe(false);
    expect(workspaceSchema.safeParse({ icon: "" }).success).toBe(false);
  });
});

describe("familyEvent のオプションフィールド", () => {
  const baseEvent = {
    id: "e-test",
    date: "2026-05-01",
    caption: "テストイベント",
    childIds: [],
    categoryIds: [],
  };

  it("imageUrl なしで valid", () => {
    const result = eventsSchema.safeParse([baseEvent]);
    expect(result.success).toBe(true);
  });

  it("height / weight あり で valid", () => {
    const result = eventsSchema.safeParse([
      { ...baseEvent, height: 110.5, weight: 18.2 },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].height).toBe(110.5);
    }
  });
});
