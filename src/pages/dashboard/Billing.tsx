import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, Users, Building, Mail, CreditCard, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAccountPlan,
  listKeys,
  AccountPlan,
  ApiKey,
  parseApiError,
  getFriendlyErrorMessage,
  ApiError,
} from "@/lib/api";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Evaluation & CI",
    limit: "100 certified runs / month",
    icon: Zap,
    features: ["Shared canonical node", "Hard cap", "No SLA"],
    note: "Not intended for production.",
    cta: "Current Plan",
    ctaAction: "none",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6,000",
    period: "/ year",
    description: "Serious Indie & Startups",
    limit: "5,000 certified runs / month",
    icon: Zap,
    features: ["Commercial CodeMode usage", "Priority access to canonical node", "Email support"],
    note: null,
    cta: "Contact",
    ctaAction: "contact",
    highlight: false,
  },
  {
    id: "team",
    name: "Pro+ / Team",
    price: "$18,000",
    period: "/ year",
    description: "Cushion Tier",
    limit: "50,000 certified runs / month",
    icon: Users,
    features: ["Multiple environments", "Priority queue"],
    note: null,
    cta: "Contact",
    ctaAction: "contact",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "From $50,000",
    period: "/ year",
    description: "Infrastructure Dependency",
    limit: "Unlimited (by contract scope)",
    icon: Building,
    features: ["Private or dedicated node option", "Audit retention", "Version guarantees", "SLAs"],
    note: null,
    cta: "Talk to Sales",
    ctaAction: "contact",
    highlight: false,
  },
];

export default function Billing() {
  const { user, loading: authLoading } = useAuth();
  const [accountPlan, setAccountPlan] = useState<AccountPlan | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoadError(null);
      try {
        const [planData, keysData] = await Promise.all([getAccountPlan(), listKeys()]);
        setAccountPlan(planData);
        setKeys(keysData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadError(parseApiError(error));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-caption">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentPlan = accountPlan?.plan || "free";
  const activeKeys = keys.filter((k) => k.status === "active");
  const usagePercent = accountPlan ? Math.min(100, (accountPlan.used / accountPlan.monthlyLimit) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Billing | NexArt Dashboard</title>
        <meta name="description" content="Manage your NexArt subscription and view pricing plans." />
      </Helmet>

      <DashboardLayout title="Billing">
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
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Current Plan - Account Level */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Account Plan
                </CardTitle>
                <CardDescription>Plan and quota are shared across all your API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-base px-3 py-1">
                    {accountPlan?.planName || "Free"}
                  </Badge>
                  <span className="text-caption">
                    {(accountPlan?.monthlyLimit || 100).toLocaleString()} certified runs / month
                  </span>
                </div>

                {/* Cancellation Notice */}
                {accountPlan?.status === "canceling" && accountPlan?.currentPeriodEnd && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Cancels on{" "}
                        {new Date(accountPlan.currentPeriodEnd).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-destructive/80">
                        You keep access until then. Resubscribe anytime to continue.
                      </p>
                    </div>
                  </div>
                )}

                {/* Usage Progress */}
                {accountPlan && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage this month</span>
                      <span className="font-medium">
                        {accountPlan.used.toLocaleString()} / {accountPlan.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                    <p className="text-xs text-caption">{accountPlan.remaining.toLocaleString()} runs remaining</p>
                  </div>
                )}

                <p className="text-sm text-caption">
                  API keys: {accountPlan?.keysUsed || 0} / {accountPlan?.maxKeys || 2}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Free: 2 keys • Pro: 5 • Pro+: 10 • Enterprise: unlimited
                </p>
              </CardContent>
            </Card>

            {/* Manual Billing Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  How Billing Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-body">
                  Billing is currently handled manually. To upgrade or change your plan, contact us directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <a href="mailto:sales@artnames.io">
                      <Mail className="h-4 w-4 mr-2" />
                      sales@artnames.io
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Contact Form</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Philosophy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How NexArt Pricing Works</CardTitle>
              </CardHeader>
              <CardContent className="text-body space-y-4">
                <p>
                  <strong>Execution is free.</strong> Run the SDK and CLI locally without limits — no API key required
                  for local execution.
                </p>
                <p>
                  <strong>Certification is what you pay for.</strong> When you need auditable, reproducible proof that
                  your artwork was executed deterministically, use the canonical renderer. That's what plans meter.
                </p>
                <p className="text-caption text-sm">
                  Same SDK. Same CLI. Same code. Paid plans unlock assurance, not features.
                </p>
                <p className="text-caption text-sm border-l-2 border-primary/30 pl-3">
                  <strong>Note:</strong> Creating multiple API keys does not increase your quota. All keys share your
                  account's monthly limit.
                </p>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = plan.id === currentPlan;
                return (
                  <Card
                    key={plan.name}
                    className={`flex flex-col ${plan.highlight ? "border-primary ring-1 ring-primary/20" : ""} ${isCurrent ? "bg-primary/5" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <Badge variant="outline">{plan.name}</Badge>
                        </div>
                        {plan.highlight && (
                          <Badge variant="default" className="text-xs">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">
                        {plan.price}
                        {plan.period && <span className="text-sm font-normal text-caption ml-1">{plan.period}</span>}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm font-medium mb-4 pb-4 border-b border-border">{plan.limit}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.note && <p className="text-xs text-caption italic mt-4">{plan.note}</p>}
                    </CardContent>
                    <div className="p-6 pt-0">
                      {isCurrent ? (
                        <Button className="w-full" variant="outline" disabled>
                          Current Plan
                        </Button>
                      ) : plan.ctaAction === "none" ? (
                        <Button className="w-full" variant="outline" disabled>
                          {plan.cta}
                        </Button>
                      ) : (
                        <Button className="w-full" asChild>
                          <a href="mailto:sales@artnames.io">{plan.cta}</a>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* What's Never Charged */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What We Never Charge For</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 md:grid-cols-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    SDK download
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    CLI usage
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    Local runs
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    Deterministic execution itself
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    Recānon verification
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    Protocol documentation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
