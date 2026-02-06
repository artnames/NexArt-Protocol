import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  getUsageSummaryByPeriod, 
  getRecentUsage, 
  UsageSummary, 
  UsageEvent,
  parseApiError,
  getFriendlyErrorMessage,
  ApiError
} from "@/lib/api";
import { Activity, CheckCircle, XCircle, Clock, Info, BarChart3, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Usage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [usageToday, setUsageToday] = useState<UsageSummary | null>(null);
  const [usageMonth, setUsageMonth] = useState<UsageSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "month">("month");

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoadError(null);
    setLoading(true);
    try {
      const [todayData, monthData, eventsData] = await Promise.all([
        getUsageSummaryByPeriod("today"),
        getUsageSummaryByPeriod("month"),
        getRecentUsage(),
      ]);
      setUsageToday(todayData);
      setUsageMonth(monthData);
      setRecentEvents(eventsData);
    } catch (error) {
      console.error("Failed to load usage data:", error);
      const apiError = parseApiError(error);
      setLoadError(apiError);
      toast({
        variant: "destructive",
        title: `Error (${apiError.code})`,
        description: getFriendlyErrorMessage(apiError),
      });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadge(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default">Success</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="secondary">Client Error</Badge>;
    } else if (statusCode >= 500) {
      return <Badge variant="destructive">Server Error</Badge>;
    }
    return <Badge variant="outline">{statusCode}</Badge>;
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-caption">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentUsage = activeTab === "today" ? usageToday : usageMonth;
  const hasNoUsage = !usageMonth || usageMonth.total === 0;

  return (
    <DashboardLayout title="Usage">
        {loading ? (
          <div className="text-caption">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Error State */}
            {loadError && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    {loadError.isServiceUnavailable ? "Service Unavailable" : "Error Loading Usage Data"}
                  </CardTitle>
                  <CardDescription className="text-destructive/80">
                    {getFriendlyErrorMessage(loadError)}
                    {loadError.code && <span className="ml-2 font-mono text-xs">({loadError.code})</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => loadData()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Explanation */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg text-sm">
              <Info className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">What counts as a certified run?</p>
                <p className="text-caption mt-1">
                  Each certified run corresponds to one call to the canonical renderer. 
                  A successful render produces a deterministic PNG and a verifiable snapshot.
                </p>
              </div>
            </div>

            {/* Summary with Tabs */}
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
                    <UsageStats usage={usageToday} period="today" />
                  </TabsContent>
                  
                  <TabsContent value="month" className="mt-0">
                    <UsageStats usage={usageMonth} period="month" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
                <CardDescription>Last 50 certified execution requests</CardDescription>
              </CardHeader>
              <CardContent>
                {hasNoUsage ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No certified runs yet</p>
                    <p className="text-caption text-sm mb-4">
                      Create an API key and run your first certified render to see usage data here.
                    </p>
                    <Link to="/dashboard/api-keys">
                      <Button variant="outline">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                ) : recentEvents.length === 0 ? (
                  <p className="text-caption">No recent events found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-caption text-sm">
                            {formatDate(event.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {event.endpoint || "/api/render"}
                          </TableCell>
                          <TableCell className="text-sm">{event.key_label}</TableCell>
                          <TableCell>{getStatusBadge(event.status_code)}</TableCell>
                          <TableCell className="text-sm">{event.duration_ms}ms</TableCell>
                          <TableCell className="text-sm text-caption">
                            {event.error_code || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
    </DashboardLayout>
  );
}

function UsageStats({ usage, period }: { usage: UsageSummary | null; period: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold">{usage?.total || 0}</p>
        <p className="text-sm text-caption">Total Runs</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {usage?.success || 0}
        </p>
        <p className="text-sm text-caption">Successful</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          {usage?.errors || 0}
        </p>
        <p className="text-sm text-caption">Errors</p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          {usage?.avg_duration_ms || 0}ms
        </p>
        <p className="text-sm text-caption">Avg Duration</p>
      </div>
    </div>
  );
}
