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
import { Plus, Box, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listApps, createApp, updateApp, deleteApp, type App } from "@/lib/projects-api";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState<string>("");
  const [autoStampEnabled, setAutoStampEnabled] = useState(true);
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
      // Fetch project name
      const { data: proj } = await supabase
        .from("projects")
        .select("name")
        .eq("id", projectId!)
        .single();
      setProjectName((proj as any)?.name ?? "Project");
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
