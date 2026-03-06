import { describe, it, expect } from "vitest";

// Unit tests for slug generation and filter logic (no DB)
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "untitled";
}

interface MockBundle {
  id: string;
  project_id: string | null;
  app_id: string | null;
}

function filterByProjectApp(
  bundles: MockBundle[],
  projectId: string | null,
  appId: string | null,
): MockBundle[] {
  return bundles.filter((b) => {
    if (projectId === "unassigned") return b.project_id === null;
    if (projectId && projectId !== "all") {
      if (b.project_id !== projectId) return false;
      if (appId && appId !== "all") {
        return b.app_id === appId;
      }
    }
    return true;
  });
}

describe("slugify", () => {
  it("converts name to slug", () => {
    expect(slugify("My Cool Project")).toBe("my-cool-project");
  });
  it("handles special chars", () => {
    expect(slugify("Test @#$ App!")).toBe("test-app");
  });
  it("returns untitled for empty", () => {
    expect(slugify("")).toBe("untitled");
  });
});

describe("filterByProjectApp", () => {
  const bundles: MockBundle[] = [
    { id: "1", project_id: "p1", app_id: "a1" },
    { id: "2", project_id: "p1", app_id: "a2" },
    { id: "3", project_id: "p2", app_id: null },
    { id: "4", project_id: null, app_id: null },
    { id: "5", project_id: null, app_id: null },
  ];

  it("returns all when no filter", () => {
    expect(filterByProjectApp(bundles, null, null)).toHaveLength(5);
  });

  it("filters by project", () => {
    const result = filterByProjectApp(bundles, "p1", null);
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.project_id === "p1")).toBe(true);
  });

  it("filters by project + app", () => {
    const result = filterByProjectApp(bundles, "p1", "a1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("shows unassigned records", () => {
    const result = filterByProjectApp(bundles, "unassigned", null);
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.project_id === null)).toBe(true);
  });

  it("unassigned records still visible with 'all' filter", () => {
    const result = filterByProjectApp(bundles, null, null);
    const unassigned = result.filter((b) => b.project_id === null);
    expect(unassigned).toHaveLength(2);
  });
});
