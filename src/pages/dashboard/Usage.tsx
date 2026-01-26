import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUsageSummaryByPeriod, getRecentUsage, UsageSummary, UsageEvent } from "@/lib/api";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Usage() {
  const [usageToday, setUsageToday] = useState<UsageSummary | null>(null);
  const [usageMonth, setUsageMonth] = useState<UsageSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  return (
    <>
      <Helmet>
        <title>Usage | NexArt Dashboard</title>
        <meta name="description" content="View your NexArt usage statistics and request logs." />
      </Helmet>
      
      <DashboardLayout title="Usage">
        {loading ? (
          <div className="text-caption">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Today */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Today
                  </CardTitle>
                  <CardDescription>Usage statistics for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-semibold">{usageToday?.total || 0}</p>
                      <p className="text-sm text-caption">Total Requests</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {usageToday?.success || 0}
                      </p>
                      <p className="text-sm text-caption">Successful</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <XCircle className="h-5 w-5 text-red-500" />
                        {usageToday?.errors || 0}
                      </p>
                      <p className="text-sm text-caption">Errors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <Clock className="h-5 w-5 text-blue-500" />
                        {usageToday?.avg_duration_ms || 0}ms
                      </p>
                      <p className="text-sm text-caption">Avg Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* This Month */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    This Month
                  </CardTitle>
                  <CardDescription>Usage statistics for this billing period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-semibold">{usageMonth?.total || 0}</p>
                      <p className="text-sm text-caption">Total Requests</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {usageMonth?.success || 0}
                      </p>
                      <p className="text-sm text-caption">Successful</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <XCircle className="h-5 w-5 text-red-500" />
                        {usageMonth?.errors || 0}
                      </p>
                      <p className="text-sm text-caption">Errors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold flex items-center gap-1">
                        <Clock className="h-5 w-5 text-blue-500" />
                        {usageMonth?.avg_duration_ms || 0}ms
                      </p>
                      <p className="text-sm text-caption">Avg Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
                <CardDescription>Last 50 certified execution requests</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <p className="text-caption">No usage events yet.</p>
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
    </>
  );
}
