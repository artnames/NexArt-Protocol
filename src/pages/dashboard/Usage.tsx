import { useEffect, useState, useMemo } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getUsageSummaryByPeriod, getRecentUsage, fetchCERBundles,
  UsageSummary, UsageEvent, parseApiError, getFriendlyErrorMessage, ApiError,
} from "@/lib/api";
import { Activity, CheckCircle, XCircle, Clock, BarChart3, AlertCircle, Eye, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CERDetailDrawer from "@/components/dashboard/CERDetailDrawer";
import CertificationSummary from "@/components/dashboard/CertificationSummary";
import RecordsFilters, { type FiltersState } from "@/components/dashboard/RecordsFilters";
import ProjectAppFilter from "@/components/dashboard/ProjectAppFilter";
import {
  enrichEventWithCER, enrichEventWithStoredBundle, computeCertificationSummary,
  type CertifiedUsageEvent,
} from "@/components/dashboard/certified-records-types";
import { supabase } from "@/integrations/supabase/client";
import { getProjectsMap, getAppsMapForProjects, type Project, type App } from "@/lib/projects-api";

export default function Usage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [usageToday, setUsageToday] = useState<UsageSummary | null>(null);
  const [usageMonth, setUsageMonth] = useState<UsageSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<CertifiedUsageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "month">("month");

  // CER drawer
  const [drawerEvent, setDrawerEvent] = useState<CertifiedUsageEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FiltersState>({
    status: "all", surface: "all", endpoint: "all", search: "",
  });

  // Project/app filter from URL params or local state
  const [selectedProject, setSelectedProject] = useState<string | null>(searchParams.get("project"));
  const [selectedApp, setSelectedApp] = useState<string | null>(searchParams.get("app"));

  // Project/app lookup maps for display
  const [projectsMap, setProjectsMap] = useState<Record<string, Project>>({});
  const [appsMap, setAppsMap] = useState<Record<string, App>>({});

  // CER bundle project/app assignments
  const [bundleAssignments, setBundleAssignments] = useState<Record<string, { project_id: string | null; app_id: string | null }>>({});

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoadError(null);
    setLoading(true);
    try {
      const [todayData, monthData, eventsData, pMap] = await Promise.all([
        getUsageSummaryByPeriod("today"),
        getUsageSummaryByPeriod("month"),
        getRecentUsage(),
        getProjectsMap(),
      ]);
      setUsageToday(todayData);
      setUsageMonth(monthData);
      setProjectsMap(pMap);

      // Fetch apps map
      const projectIds = Object.keys(pMap);
      if (projectIds.length > 0) {
        const aMap = await getAppsMapForProjects(projectIds);
        setAppsMap(aMap);
      }

      // Fetch stored CER bundles for attest AND render events
      const bundleEventIds = eventsData
        .filter(e => (e.endpoint?.includes("attest") || e.endpoint?.includes("render")) && e.status_code >= 200 && e.status_code < 300)
        .map(e => Number(e.id))
        .filter(n => !isNaN(n));

      let storedBundles: Awaited<ReturnType<typeof fetchCERBundles>> = {};
      if (bundleEventIds.length > 0) {
        try {
          storedBundles = await fetchCERBundles(bundleEventIds);
        } catch (e) {
          console.warn("Failed to fetch CER bundles:", e);
        }
      }

      // Fetch project/app assignments for CER bundles
      if (bundleEventIds.length > 0) {
        try {
          const { data: assignments } = await supabase
            .from("cer_bundles")
            .select("usage_event_id, project_id, app_id")
            .in("usage_event_id", bundleEventIds);
          const assignMap: Record<string, { project_id: string | null; app_id: string | null }> = {};
          for (const a of (assignments ?? []) as any[]) {
            assignMap[String(a.usage_event_id)] = { project_id: a.project_id, app_id: a.app_id };
          }
          setBundleAssignments(assignMap);
        } catch { /* ignore */ }
      }

      // Enrich events with stored bundles where available
      const enriched = await Promise.all(eventsData.map(async (ev) => {
        const base = enrichEventWithCER(ev);
        const stored = storedBundles[Number(ev.id)];
        if (stored) {
          return enrichEventWithStoredBundle(base, stored);
        }
        return base;
      }));

      setRecentEvents(enriched);
    } catch (error) {
      console.error("Failed to load usage data:", error);
      const apiError = parseApiError(error);
      setLoadError(apiError);
      toast({ variant: "destructive", title: `Error (${apiError.code})`, description: getFriendlyErrorMessage(apiError) });
    } finally {
      setLoading(false);
    }
  }

  // Certification summary (events are already enriched)
  const certifiedEvents = recentEvents;

  // Certification summary
  const certSummary = useMemo(() => computeCertificationSummary(certifiedEvents), [certifiedEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return certifiedEvents.filter((e) => {
      if (filters.status === "success" && !(e.status_code >= 200 && e.status_code < 300)) return false;
      if (filters.status === "client_error" && !(e.status_code >= 400 && e.status_code < 500)) return false;
      if (filters.status === "server_error" && !(e.status_code >= 500)) return false;
      if (filters.surface !== "all" && e.surface !== filters.surface) return false;
      if (filters.endpoint !== "all" && e.endpoint !== filters.endpoint) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchHash = e.normalized.certificateHash?.toLowerCase().includes(q);
        const matchId = e.normalized.executionId?.toLowerCase().includes(q) || String(e.id).toLowerCase().includes(q);
        if (!matchHash && !matchId) return false;
      }
      // Project/app filter
      const assign = bundleAssignments[String(e.id)];
      if (selectedProject === "unassigned") {
        if (assign?.project_id) return false;
      } else if (selectedProject) {
        if (assign?.project_id !== selectedProject) return false;
        if (selectedApp && assign?.app_id !== selectedApp) return false;
      }
      return true;
    });
  }, [certifiedEvents, filters, selectedProject, selectedApp, bundleAssignments]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function getStatusBadge(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) return <Badge variant="default">Success</Badge>;
    if (statusCode >= 400 && statusCode < 500) return <Badge variant="secondary">Client Error</Badge>;
    if (statusCode >= 500) return <Badge variant="destructive">Server Error</Badge>;
    return <Badge variant="outline">{statusCode}</Badge>;
  }

  function shortenHash(hash: string | undefined | null) {
    if (!hash) return "—";
    // sha256:abcdef...1234
    const raw = hash.replace("sha256:", "");
    return `sha256:${raw.slice(0, 4)}…${raw.slice(-4)}`;
  }

  function openDrawer(event: CertifiedUsageEvent) {
    setDrawerEvent(event);
    setDrawerOpen(true);
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasNoUsage = !usageMonth || usageMonth.total === 0;

  return (
    <DashboardLayout title="Usage & Certified Records">
      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Microcopy */}
          <p className="text-xs text-muted-foreground font-mono leading-relaxed">
            This console provides visibility into Certified Execution Records generated by the NexArt canonical node. Production systems typically embed certification into their own infrastructure.
          </p>

          {/* Error State */}
          {loadError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  {loadError.isServiceUnavailable ? "Service Unavailable" : "Error Loading Data"}
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  {getFriendlyErrorMessage(loadError)}
                  {loadError.code && <span className="ml-2 font-mono text-xs">({loadError.code})</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => loadData()}>Try Again</Button>
              </CardContent>
            </Card>
          )}

          {/* Usage Summary with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "today" | "month")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-0">
                  <UsageStats usage={usageToday} />
                </TabsContent>
                <TabsContent value="month" className="mt-0">
                  <UsageStats usage={usageMonth} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Certification Summary */}
          {!hasNoUsage && (
            <CertificationSummary
              total={certSummary.total}
              successRate={certSummary.successRate}
              aiCount={certSummary.aiCount}
              codeModeCount={certSummary.codeModeCount}
            />
          )}

          {/* Certified Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">Certified Records</CardTitle>
              <CardDescription>Last 50 certified execution requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasNoUsage ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No certified runs yet</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create an API key and run your first certified render to see records here.
                  </p>
                  <Link to="/dashboard/api-keys">
                    <Button variant="outline">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <ProjectAppFilter
                      projectId={selectedProject}
                      appId={selectedApp}
                      onChangeProject={setSelectedProject}
                      onChangeApp={setSelectedApp}
                    />
                    <RecordsFilters filters={filters} onChange={setFilters} />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Project / App</TableHead>
                          <TableHead>Surface</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Certificate Hash</TableHead>
                          <TableHead>Protocol</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="w-[60px]">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                              No records match filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                {formatDate(event.created_at)}
                              </TableCell>
                              <TableCell className="text-xs">
                                {(() => {
                                  const assign = bundleAssignments[String(event.id)];
                                  const proj = assign?.project_id ? projectsMap[assign.project_id] : null;
                                  const app = assign?.app_id ? appsMap[assign.app_id] : null;
                                  if (!proj) return <span className="text-muted-foreground">—</span>;
                                  return (
                                    <span className="font-mono">
                                      {proj.name}{app ? ` / ${app.name}` : ""}
                                    </span>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  {event.surface === "ai" ? "AI" : "Code Mode"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{event.endpoint || "/api/render"}</TableCell>
                              <TableCell className="text-xs">{event.key_label}</TableCell>
                              <TableCell>{getStatusBadge(event.status_code)}</TableCell>
                              <TableCell>
                                {event.normalized.certificateHash ? (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(event.normalized.certificateHash!);
                                      toast({ title: "Copied", description: "Certificate hash copied." });
                                    }}
                                    className="flex items-center gap-1 font-mono text-xs text-foreground hover:text-primary transition-colors"
                                    title={event.normalized.certificateHash}
                                  >
                                    {shortenHash(event.normalized.certificateHash)}
                                    <Copy className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {event.normalized.protocolVersion || "—"}
                              </TableCell>
                              <TableCell className="text-xs">{event.duration_ms}ms</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openDrawer(event)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CERDetailDrawer
        event={drawerEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        projectName={drawerEvent ? (bundleAssignments[String(drawerEvent.id)]?.project_id ? projectsMap[bundleAssignments[String(drawerEvent.id)]!.project_id!]?.name : null) : null}
        appName={drawerEvent ? (bundleAssignments[String(drawerEvent.id)]?.app_id ? appsMap[bundleAssignments[String(drawerEvent.id)]!.app_id!]?.name : null) : null}
      />
    </DashboardLayout>
  );
}

function UsageStats({ usage }: { usage: UsageSummary | null }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold">{usage?.total || 0}</p>
        <p className="text-sm text-muted-foreground">Total Runs</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {usage?.success || 0}
        </p>
        <p className="text-sm text-muted-foreground">Successful</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          {usage?.errors || 0}
        </p>
        <p className="text-sm text-muted-foreground">Errors</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          {usage?.avg_duration_ms || 0}ms
        </p>
        <p className="text-sm text-muted-foreground">Avg Duration</p>
      </div>
    </div>
  );
}
