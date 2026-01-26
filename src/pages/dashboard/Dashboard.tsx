import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listKeys, getUsageSummaryByPeriod, ApiKey, UsageSummary } from "@/lib/api";
import { Key, BarChart3, ArrowRight, Zap } from "lucide-react";

export default function Dashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usageMonth, setUsageMonth] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [keysData, usageData] = await Promise.all([
          listKeys(),
          getUsageSummaryByPeriod("month"),
        ]);
        setKeys(keysData);
        setUsageMonth(usageData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeKeys = keys.filter((k) => k.status === "active");
  const currentPlan = activeKeys.length > 0 ? activeKeys[0].plan : "free";
  const monthlyLimit = activeKeys.length > 0 ? activeKeys[0].monthly_limit : 100;

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise": return "default";
      case "team": return "secondary";
      case "pro": return "outline";
      default: return "outline";
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | NexArt</title>
        <meta name="description" content="NexArt Dashboard - Manage your API keys and view usage statistics." />
      </Helmet>
      
      <DashboardLayout title="Dashboard">
        {loading ? (
          <div className="text-caption">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Plan & Usage Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Current Plan</CardDescription>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(currentPlan)} className="capitalize">
                      {currentPlan}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-caption">
                    {monthlyLimit.toLocaleString()} certified runs/month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Usage This Month</CardDescription>
                  <CardTitle>{usageMonth?.total?.toLocaleString() || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-caption">
                    of {monthlyLimit.toLocaleString()} certified runs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle>
                    {usageMonth?.total
                      ? `${Math.round((usageMonth.success / usageMonth.total) * 100)}%`
                      : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-caption">
                    {usageMonth?.errors || 0} errors this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Keys</CardDescription>
                  <CardTitle>{activeKeys.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-caption">
                    {keys.length} total keys
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for certified execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard/api-keys">
                    <Button variant="outline" className="w-full justify-between">
                      Manage Keys
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Usage Analytics
                  </CardTitle>
                  <CardDescription>
                    View detailed usage statistics and logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard/usage">
                    <Button variant="outline" className="w-full justify-between">
                      View Usage
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade CTA */}
            {currentPlan === "free" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    Upgrade Your Plan
                  </CardTitle>
                  <CardDescription>
                    Get more certified execution capacity and unlock team features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard/billing">
                    <Button>
                      View Plans
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
                <CardDescription>
                  Use your API key with the NexArt renderer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="text-caption"># Set your environment variables</div>
                  <div className="mt-1">export NEXART_API_KEY=nx_live_...</div>
                  <div className="mt-3 text-caption"># Run a certified render</div>
                  <div className="mt-1">nexart run examples/sketch.js --seed 12345 --include-code --out out.png</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
