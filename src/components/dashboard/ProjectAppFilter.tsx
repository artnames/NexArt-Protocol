import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listProjects, listApps, type Project, type App } from "@/lib/projects-api";

interface ProjectAppFilterProps {
  projectId: string | null;
  appId: string | null;
  onChangeProject: (projectId: string | null) => void;
  onChangeApp: (appId: string | null) => void;
}

export default function ProjectAppFilter({ projectId, appId, onChangeProject, onChangeApp }: ProjectAppFilterProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (projectId && projectId !== "all" && projectId !== "unassigned") {
      listApps(projectId).then(setApps).catch(() => setApps([]));
    } else {
      setApps([]);
    }
  }, [projectId]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={projectId ?? "all"}
        onValueChange={(v) => {
          const val = v === "all" ? null : v;
          onChangeProject(val);
          onChangeApp(null);
        }}
      >
        <SelectTrigger className="w-[160px] h-8 text-xs font-mono">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {projectId && projectId !== "all" && projectId !== "unassigned" && apps.length > 0 && (
        <Select
          value={appId ?? "all"}
          onValueChange={(v) => onChangeApp(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs font-mono">
            <SelectValue placeholder="App" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Apps</SelectItem>
            {apps.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
