import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Box, Pencil, Trash2, ArrowLeft, FileDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listApps, createApp, updateApp, deleteApp, type App, type RetentionPolicy, RETENTION_LABELS } from "@/lib/projects-api";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { buildProjectExportRow, rowsToCsv, downloadCsv, type ProjectExportRow } from "@/lib/audit-export";
import { normalizeCertifiedRecord } from "@/components/dashboard/certified-records-types";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState<string>("");
  const [autoStampEnabled, setAutoStampEnabled] = useState(true);
  const [retentionPolicy, setRetentionPolicy] = useState<RetentionPolicy>('forever');
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const [editApp, setEditApp] = useState<App | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (user && projectId) loadData();
  }, [user, projectId]);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch project details
      const { data: proj } = await supabase
        .from("projects")
        .select("name, auto_stamp_enabled, retention_policy")
        .eq("id", projectId!)
        .single();
      setProjectName((proj as any)?.name ?? "Project");
      setAutoStampEnabled((proj as any)?.auto_stamp_enabled ?? true);
      setRetentionPolicy((proj as any)?.retention_policy ?? 'forever');
      setApps(await listApps(projectId!));
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim() || !projectId) return;
    try {
      await createApp(projectId, createName.trim());
      setCreateName("");
      setCreateOpen(false);
      toast({ title: "App created" });
      loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to create app." });
    }
  }

  async function handleUpdate() {
    if (!editApp || !editName.trim()) return;
    try {
      await updateApp(editApp.id, editName.trim());
      setEditApp(null);
      toast({ title: "App renamed" });
      loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to rename." });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this app?")) return;
    try {
      await deleteApp(id);
      toast({ title: "App deleted" });
      loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to delete." });
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <DashboardLayout title={projectName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard/projects" className="text-xs text-muted-foreground font-mono hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Projects
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  // Fetch CER bundles for this project
                  const { data: bundles, error } = await supabase
                    .from("cer_bundles")
                    .select("usage_event_id, certificate_hash, bundle_type, cer_bundle_redacted, attestation_json, created_at, app_id")
                    .eq("project_id", projectId!);
                  if (error) throw error;
                  if (!bundles || bundles.length === 0) {
                    toast({ title: "No records", description: "No CER records found for this project." });
                    return;
                  }

                  const appsById: Record<string, App> = {};
                  for (const a of apps) appsById[a.id] = a;

                  const rows: ProjectExportRow[] = (bundles as any[]).map((b) => {
                    const rawBundle = b.cer_bundle_redacted as Record<string, unknown>;
                    const fakeEvent = {
                      id: String(b.usage_event_id),
                      created_at: b.created_at,
                      endpoint: rawBundle?.bundleType === "cer.ai.execution.v1" ? "/api/attest" : "/api/render",
                      status_code: 200,
                      duration_ms: 0,
                      error_code: null,
                      key_label: "",
                    };
                    const n = normalizeCertifiedRecord(fakeEvent, rawBundle as any);
                    const appName = b.app_id ? (appsById[b.app_id]?.name ?? "") : "";
                    return buildProjectExportRow(
                      { ...fakeEvent, surface: n.surface, normalized: n },
                      projectName,
                      appName,
                      n.verificationStatus === "pass" ? "VERIFIED" : n.verificationStatus === "fail" ? "INVALID" : "PARTIAL",
                    );
                  });

                  const csv = rowsToCsv(rows);
                  downloadCsv(csv, `${projectName.toLowerCase().replace(/\s+/g, "-")}-records.csv`);
                  toast({ title: `Exported ${rows.length} records` });
                } catch (e: any) {
                  toast({ variant: "destructive", title: "Export failed", description: e.message || "Failed to export." });
                }
              }}
            >
              <FileDown className="h-4 w-4 mr-1" /> Export records (CSV)
            </Button>
            <Link to={`/dashboard/usage?project=${projectId}`}>
              <Button variant="outline" size="sm">View Records</Button>
            </Link>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New App</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create App</DialogTitle>
                  <DialogDescription>Add an app to "{projectName}".</DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="App name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={!createName.trim()}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
      </div>

        {/* Auto-stamp setting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Switch
                id="auto-stamp-toggle"
                checked={autoStampEnabled}
                onCheckedChange={async (checked) => {
                  setAutoStampEnabled(checked);
                  try {
                    await supabase
                      .from("projects")
                      .update({ auto_stamp_enabled: checked, updated_at: new Date().toISOString() })
                      .eq("id", projectId!);
                    toast({ title: checked ? "Auto-stamp enabled" : "Auto-stamp disabled" });
                  } catch {
                    setAutoStampEnabled(!checked);
                    toast({ variant: "destructive", title: "Error", description: "Failed to update setting." });
                  }
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="auto-stamp-toggle" className="cursor-pointer">
                  Auto-stamp CERs during ingestion
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, NexArt automatically requests a signed node receipt for each new record in this project. This improves offline verifiability but uses additional node attestations.
                </p>
              </div>
            </div>

            {/* Retention policy */}
            <div className="flex items-start gap-4 pt-4 border-t border-border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="retention-select" className="cursor-pointer">
                  Retention policy
                </Label>
                <p className="text-xs text-muted-foreground">
                  Controls how long NexArt-hosted CER records are retained for this project. Exported CERs remain portable artifacts and are not affected.
                </p>
                {/* TODO: Enforcement is future work. Current behavior is display/config only. */}
              </div>
              <Select
                value={retentionPolicy}
                onValueChange={async (val: RetentionPolicy) => {
                  const prev = retentionPolicy;
                  setRetentionPolicy(val);
                  try {
                    await supabase
                      .from("projects")
                      .update({ retention_policy: val, updated_at: new Date().toISOString() })
                      .eq("id", projectId!);
                    toast({ title: `Retention set to ${RETENTION_LABELS[val]}` });
                  } catch {
                    setRetentionPolicy(prev);
                    toast({ variant: "destructive", title: "Error", description: "Failed to update retention policy." });
                  }
                }}
              >
                <SelectTrigger id="retention-select" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(RETENTION_LABELS) as [RetentionPolicy, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Box className="h-5 w-5" /> Apps
            </CardTitle>
            <CardDescription>Apps in this project</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : apps.length === 0 ? (
              <div className="text-center py-8">
                <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No apps yet</p>
                <p className="text-muted-foreground text-sm mb-4">Add an app to start organizing CER records within this project.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{a.slug}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link to={`/dashboard/usage?project=${projectId}&app=${a.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">Records</Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditApp(a); setEditName(a.name); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editApp} onOpenChange={(o) => !o && setEditApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename App</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            autoFocus
          />
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
