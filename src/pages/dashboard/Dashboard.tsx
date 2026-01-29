import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  listKeys, 
  getUsageSummaryByPeriod, 
  getAccountPlan,
  ApiKey, 
  AccountPlan,
  UsageSummary,
  parseApiError,
  getFriendlyErrorMessage,
  ApiError
} from "@/lib/api";
import { Key, BarChart3, ArrowRight, Zap, Plus, Terminal, AlertTriangle, FileImage, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [accountPlan, setAccountPlan] = useState<AccountPlan | null>(null);
  const [usageMonth, setUsageMonth] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoadError(null);
    try {
      const [keysData, usageData, planData] = await Promise.all([
        listKeys(),
        getUsageSummaryByPeriod("month"),
        getAccountPlan(),
      ]);
      setKeys(keysData);
      setUsageMonth(usageData);
      setAccountPlan(planData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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

  const activeKeys = keys.filter((k) => k.status === "active");
  
  // Account-level plan and quota
  const currentPlan = accountPlan?.plan || "free";
  const monthlyLimit = accountPlan?.monthlyLimit || 100;
  const usedThisMonth = accountPlan?.used || 0;

  const usagePercent = monthlyLimit > 0 
    ? Math.min(100, (usedThisMonth / monthlyLimit) * 100)
    : 0;

  const successRate = usageMonth?.total 
    ? Math.round((usageMonth.success / usageMonth.total) * 100) 
    : null;

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise": return "default";
      case "team": return "secondary";
      case "pro": return "outline";
      default: return "outline";
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-caption">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasNoActiveKeys = activeKeys.length === 0;
  const hasNoUsage = !usageMonth || usageMonth.total === 0;

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
                  <Button variant="outline" onClick={() => loadData()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* No Keys CTA */}
            {hasNoActiveKeys && !loadError && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5" />
                    Create your first API key
                  </CardTitle>
                  <CardDescription>
                    You need an API key to run certified renders with the canonical renderer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard/api-keys">
                    <Button>
                      <Key className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Account Plan & Usage Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Account Plan</CardDescription>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant={getPlanBadgeVariant(currentPlan)}>
                      {accountPlan?.planName || "Free"}
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
                  <CardTitle>{usedThisMonth.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={usagePercent} className="h-2" />
                  <p className="text-sm text-caption">
                    {usagePercent.toFixed(0)}% of {monthlyLimit.toLocaleString()} limit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle>
                    {successRate !== null ? `${successRate}%` : "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-caption">
                    {hasNoUsage 
                      ? "No certified runs yet"
                      : `${usageMonth?.errors || 0} errors this month`
                    }
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
                    {keys.length} total keys (max 10)
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
            {currentPlan === "free" && !hasNoActiveKeys && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    Upgrade Your Plan
                  </CardTitle>
                  <CardDescription>
                    Get more certified runs and unlock priority queue access
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
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Run your first certified render with the NexArt CLI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto space-y-3">
                  <div>
                    <div className="text-caption"># Set environment variables</div>
                    <div className="mt-1">export NEXART_RENDERER_ENDPOINT="https://nexart-canonical-renderer-production.up.railway.app"</div>
                    <div className="mt-1">export NEXART_API_KEY="nx_live_..."</div>
                  </div>
                  <div>
                    <div className="text-caption"># Run a certified render</div>
                    <div className="mt-1">npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js \</div>
                    <div className="pl-4">--seed 12345 --vars "50,50,50,0,0,0,0,0,0,0" \</div>
                    <div className="pl-4">--include-code --out out.png</div>
                  </div>
                  <div>
                    <div className="text-caption"># Verify the snapshot</div>
                    <div className="mt-1">npx --yes @nexart/cli@0.2.3 verify out.snapshot.json</div>
                  </div>
                </div>

                {/* PNG Warning */}
                <div className="flex items-start gap-3 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 p-3 rounded-md">
                  <FileImage className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">The canonical renderer returns a PNG (image/png), not JSON.</p>
                    <p className="text-caption mt-1">Treat responses as binary data. Parse the snapshot file separately.</p>
                  </div>
                </div>

                {/* Canvas Warning */}
                <div className="flex items-start gap-3 text-sm text-caption bg-muted/50 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Canonical size is enforced (1950×2400). Do not pass custom width/height.</span>
                </div>

                <Link to="/builders/cli" className="inline-block">
                  <Button variant="link" className="p-0 h-auto text-sm">
                    View full CLI documentation →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
