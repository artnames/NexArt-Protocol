import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
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
import { Plus, FolderOpen, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listProjects, createProject, updateProject, deleteProject, type Project, RETENTION_LABELS, type RetentionPolicy } from "@/lib/projects-api";

export default function Projects() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Edit dialog
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  async function loadProjects() {
    setLoading(true);
    try {
      setProjects(await listProjects());
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load projects." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    try {
      await createProject(createName.trim());
      setCreateName("");
      setCreateOpen(false);
      toast({ title: "Project created" });
      loadProjects();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to create project." });
    }
  }

  async function handleUpdate() {
    if (!editProject || !editName.trim()) return;
    try {
      await updateProject(editProject.id, { name: editName.trim() });
      setEditProject(null);
      toast({ title: "Project renamed" });
      loadProjects();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to rename." });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its apps?")) return;
    try {
      await deleteProject(id);
      toast({ title: "Project deleted" });
      loadProjects();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to delete." });
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">
            Organize CER records by project and app.
          </p>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Give your project a name. You can add apps inside it later.</DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Project name"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" /> Projects
            </CardTitle>
            <CardDescription>Your projects and their apps</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No projects yet</p>
                <p className="text-muted-foreground text-sm mb-4">Create a project to organize your CER records.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link to={`/dashboard/projects/${p.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                          {p.name}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{p.slug}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditProject(p); setEditName(p.name); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
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
      <Dialog open={!!editProject} onOpenChange={(o) => !o && setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
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
