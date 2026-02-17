import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export interface FiltersState {
  status: string;
  surface: string;
  endpoint: string;
  search: string;
}

interface RecordsFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

export default function RecordsFilters({ filters, onChange }: RecordsFiltersProps) {
  const set = (key: keyof FiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className="w-[140px] h-8 text-xs font-mono">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="success">Success</SelectItem>
          <SelectItem value="client_error">Client Error</SelectItem>
          <SelectItem value="server_error">Server Error</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.surface} onValueChange={(v) => set("surface", v)}>
        <SelectTrigger className="w-[130px] h-8 text-xs font-mono">
          <SelectValue placeholder="Surface" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="ai">AI</SelectItem>
          <SelectItem value="codemode">Code Mode</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.endpoint} onValueChange={(v) => set("endpoint", v)}>
        <SelectTrigger className="w-[150px] h-8 text-xs font-mono">
          <SelectValue placeholder="Endpoint" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="/api/attest">/api/attest</SelectItem>
          <SelectItem value="/api/render">/api/render</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search hash or execution ID…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="h-8 pl-8 text-xs font-mono"
        />
      </div>
    </div>
  );
}
