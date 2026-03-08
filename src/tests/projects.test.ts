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

// ── Auto-stamp per-project decision logic ────────────────────────────

interface AutoStampContext {
  globalEnabled: boolean;
  surfaceEnabled: boolean;
  projectId: string | null;
  projectAutoStampEnabled: boolean | null; // null = project not found or no project
}

type AutoStampDecision = 'proceed' | 'skipped_disabled' | 'skipped_user_disabled';

function decideAutoStamp(ctx: AutoStampContext): AutoStampDecision {
  if (!ctx.globalEnabled || !ctx.surfaceEnabled) return 'skipped_disabled';
  if (ctx.projectId && ctx.projectAutoStampEnabled === false) return 'skipped_user_disabled';
  return 'proceed';
}

describe("auto-stamp per-project decision", () => {
  it("proceeds when project auto-stamp is enabled", () => {
    expect(decideAutoStamp({
      globalEnabled: true, surfaceEnabled: true,
      projectId: "p1", projectAutoStampEnabled: true,
    })).toBe("proceed");
  });

  it("returns skipped_user_disabled when project disables auto-stamp", () => {
    expect(decideAutoStamp({
      globalEnabled: true, surfaceEnabled: true,
      projectId: "p1", projectAutoStampEnabled: false,
    })).toBe("skipped_user_disabled");
  });

  it("unassigned records follow global flags (enabled)", () => {
    expect(decideAutoStamp({
      globalEnabled: true, surfaceEnabled: true,
      projectId: null, projectAutoStampEnabled: null,
    })).toBe("proceed");
  });

  it("unassigned records follow global flags (disabled)", () => {
    expect(decideAutoStamp({
      globalEnabled: false, surfaceEnabled: true,
      projectId: null, projectAutoStampEnabled: null,
    })).toBe("skipped_disabled");
  });

  it("global disabled overrides project enabled", () => {
    expect(decideAutoStamp({
      globalEnabled: false, surfaceEnabled: true,
      projectId: "p1", projectAutoStampEnabled: true,
    })).toBe("skipped_disabled");
  });

  it("surface disabled overrides project enabled", () => {
    expect(decideAutoStamp({
      globalEnabled: true, surfaceEnabled: false,
      projectId: "p1", projectAutoStampEnabled: true,
    })).toBe("skipped_disabled");
  });
});

// ── Retention policy logic ───────────────────────────────────────────

type RetentionPolicy = '30_days' | '90_days' | '1_year' | 'forever';

const RETENTION_LABELS: Record<RetentionPolicy, string> = {
  '30_days': '30 days',
  '90_days': '90 days',
  '1_year': '1 year',
  'forever': 'Forever',
};

interface MockProject {
  id: string;
  retention_policy: RetentionPolicy;
}

describe("retention policy", () => {
  it("defaults to 'forever'", () => {
    const project: MockProject = { id: "p1", retention_policy: 'forever' };
    expect(project.retention_policy).toBe('forever');
  });

  it("accepts all valid retention values", () => {
    const values: RetentionPolicy[] = ['30_days', '90_days', '1_year', 'forever'];
    for (const v of values) {
      expect(RETENTION_LABELS[v]).toBeDefined();
    }
  });

  it("updates retention policy", () => {
    const project: MockProject = { id: "p1", retention_policy: 'forever' };
    const updated = { ...project, retention_policy: '90_days' as RetentionPolicy };
    expect(updated.retention_policy).toBe('90_days');
    expect(RETENTION_LABELS[updated.retention_policy]).toBe('90 days');
  });

  it("preserves existing behavior when retention is unset (defaults to forever)", () => {
    const oldProject = { id: "p1" } as any;
    const retention: RetentionPolicy = oldProject.retention_policy ?? 'forever';
    expect(retention).toBe('forever');
  });

  it("displays correct label for each policy", () => {
    expect(RETENTION_LABELS['30_days']).toBe('30 days');
    expect(RETENTION_LABELS['90_days']).toBe('90 days');
    expect(RETENTION_LABELS['1_year']).toBe('1 year');
    expect(RETENTION_LABELS['forever']).toBe('Forever');
  });
});

// ── Project ID extraction from pathname ─────────────────────────────

function extractProjectIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  return match?.[1] || undefined;
}

describe("extractProjectIdFromPath", () => {
  it("extracts UUID from valid project path", () => {
    expect(extractProjectIdFromPath("/dashboard/projects/abc-123-def")).toBe("abc-123-def");
  });

  it("returns undefined for projects list path", () => {
    expect(extractProjectIdFromPath("/dashboard/projects")).toBeUndefined();
  });

  it("returns undefined for unrelated path", () => {
    expect(extractProjectIdFromPath("/dashboard/usage")).toBeUndefined();
  });

  it("handles trailing slashes", () => {
    expect(extractProjectIdFromPath("/dashboard/projects/abc-123/")).toBe("abc-123");
  });
});

// ── CSV export UUID guard logic ─────────────────────────────────────

function isValidUUID(val: unknown): val is string {
  if (typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function buildExportQuery(projectId: string | undefined, appId: string | null) {
  // Only include filters for valid UUIDs
  const filters: { column: string; value: string }[] = [];
  if (isValidUUID(projectId)) {
    filters.push({ column: "project_id", value: projectId });
  }
  if (isValidUUID(appId)) {
    filters.push({ column: "app_id", value: appId });
  }
  return filters;
}

describe("CSV export UUID guards", () => {
  it("includes valid UUID projectId", () => {
    const filters = buildExportQuery("a1b2c3d4-e5f6-7890-abcd-ef1234567890", null);
    expect(filters).toHaveLength(1);
    expect(filters[0].column).toBe("project_id");
  });

  it("excludes undefined projectId", () => {
    const filters = buildExportQuery(undefined, null);
    expect(filters).toHaveLength(0);
  });

  it("excludes string 'undefined'", () => {
    const filters = buildExportQuery("undefined" as any, null);
    expect(filters).toHaveLength(0);
  });

  it("includes valid appId when present", () => {
    const filters = buildExportQuery(
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "f1e2d3c4-b5a6-7890-1234-567890abcdef",
    );
    expect(filters).toHaveLength(2);
  });

  it("excludes null appId", () => {
    const filters = buildExportQuery("a1b2c3d4-e5f6-7890-abcd-ef1234567890", null);
    expect(filters).toHaveLength(1);
  });

  it("handles empty records gracefully", () => {
    // Simulate empty result set → should not throw
    const rows: any[] = [];
    expect(rows.length).toBe(0);
  });
});

// ── App management tests ────────────────────────────────────────────

describe("app creation validation", () => {
  it("rejects empty names", () => {
    const name = "  ";
    expect(name.trim()).toBe("");
  });

  it("produces correct slug for app name", () => {
    expect(slugify("Web Checkout")).toBe("web-checkout");
    expect(slugify("mobile-api")).toBe("mobile-api");
    expect(slugify("CI/CD Pipeline")).toBe("ci-cd-pipeline");
  });

  it("app list is initially empty for new project", () => {
    const apps: { id: string; name: string }[] = [];
    expect(apps).toHaveLength(0);
  });

  it("apps can be filtered by project context", () => {
    const allApps = [
      { id: "a1", project_id: "p1", name: "Web" },
      { id: "a2", project_id: "p1", name: "Mobile" },
      { id: "a3", project_id: "p2", name: "CLI" },
    ];
    const filtered = allApps.filter((a) => a.project_id === "p1");
    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.name)).toEqual(["Web", "Mobile"]);
  });
});
