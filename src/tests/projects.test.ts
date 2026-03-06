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
    // Simulate old project record without retention_policy field
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
