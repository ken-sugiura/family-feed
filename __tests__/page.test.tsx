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

describe("workspace-ui-kit smoke tests", () => {
  it("all seed data files parse without errors", () => {
    expect(childrenSchema.safeParse(childrenData).success).toBe(true);
    expect(categoriesSchema.safeParse(categoriesData).success).toBe(true);
    expect(eventsSchema.safeParse(eventsData).success).toBe(true);
    expect(workspaceSchema.safeParse(workspaceData).success).toBe(true);
  });
});
