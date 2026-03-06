import { supabase } from "@/integrations/supabase/client";

export type RetentionPolicy = '30_days' | '90_days' | '1_year' | 'forever';

export const RETENTION_LABELS: Record<RetentionPolicy, string> = {
  '30_days': '30 days',
  '90_days': '90 days',
  '1_year': '1 year',
  'forever': 'Forever',
};

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  auto_stamp_enabled: boolean;
  retention_policy: RetentionPolicy;
  created_at: string;
  updated_at: string;
}

export interface App {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "untitled";
}

// ── Projects ────────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Project[];
}

export async function createProject(name: string): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, slug: slugify(name), user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Project;
}

export async function updateProject(id: string, fields: { name?: string; auto_stamp_enabled?: boolean; retention_policy?: RetentionPolicy }): Promise<Project> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.name !== undefined) {
    updates.name = fields.name;
    updates.slug = slugify(fields.name);
  }
  if (fields.auto_stamp_enabled !== undefined) {
    updates.auto_stamp_enabled = fields.auto_stamp_enabled;
  }
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ── Apps ─────────────────────────────────────────────────────────────

export async function listApps(projectId: string): Promise<App[]> {
  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as App[];
}

export async function createApp(projectId: string, name: string): Promise<App> {
  const { data, error } = await supabase
    .from("apps")
    .insert({ project_id: projectId, name, slug: slugify(name) })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as App;
}

export async function updateApp(id: string, name: string): Promise<App> {
  const { data, error } = await supabase
    .from("apps")
    .update({ name, slug: slugify(name), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as App;
}

export async function deleteApp(id: string): Promise<void> {
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) throw error;
}

// ── CER bundle assignment ────────────────────────────────────────────

export async function assignCERToApp(bundleId: string, projectId: string | null, appId: string | null): Promise<void> {
  const { error } = await supabase
    .from("cer_bundles")
    .update({ project_id: projectId, app_id: appId })
    .eq("id", bundleId);
  if (error) throw error;
}

// ── Lookup helpers for enrichment ────────────────────────────────────

export async function getProjectsMap(): Promise<Record<string, Project>> {
  const projects = await listProjects();
  const map: Record<string, Project> = {};
  for (const p of projects) map[p.id] = p;
  return map;
}

export async function getAppsMapForProjects(projectIds: string[]): Promise<Record<string, App>> {
  if (projectIds.length === 0) return {};
  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .in("project_id", projectIds);
  if (error) throw error;
  const map: Record<string, App> = {};
  for (const a of (data ?? []) as unknown as App[]) map[a.id] = a;
  return map;
}
