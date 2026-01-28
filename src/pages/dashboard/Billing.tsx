import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, Building, Mail, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listKeys, ApiKey } from "@/lib/api";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Evaluation & CI",
    limit: "100 certified runs / month",
    icon: Zap,
    features: [
      "Shared canonical node",
      "Hard cap",
      "No SLA",
    ],
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
    limit: "~5,000 certified runs / month",
    icon: Zap,
    features: [
      "Commercial CodeMode usage",
      "Priority access to canonical node",
      "Email support",
    ],
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
    limit: "~50,000 certified runs / month",
    icon: Users,
    features: [
      "Multiple environments",
      "Priority queue",
    ],
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
    features: [
      "Private or dedicated node option",
      "Audit retention",
      "Version guarantees",
      "SLAs",
    ],
    note: null,
    cta: "Talk to Sales",
    ctaAction: "contact",
    highlight: false,
  },
];

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Pro+ / Team",
  enterprise: "Enterprise",
};

function getHighestPlan(keys: ApiKey[]): string {
  const planOrder = ["enterprise", "team", "pro", "free"];
  const activeKeys = keys.filter((k) => k.status === "active");
  for (const plan of planOrder) {
    if (activeKeys.some((k) => k.plan === plan)) {
      return plan;
    }
  }
  return "free";
}

export default function Billing() {
  const { user, loading: authLoading } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      try {
        const keysData = await listKeys();
        setKeys(keysData);
      } catch (error) {
        console.error("Failed to load keys:", error);
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

  const currentPlan = getHighestPlan(keys);
  const activeKeys = keys.filter((k) => k.status === "active");
  const monthlyLimit = activeKeys.length > 0 
    ? Math.max(...activeKeys.map(k => k.monthly_limit))
    : 100;

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
            {/* Current Plan */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-base px-3 py-1">
                    {PLAN_NAMES[currentPlan] || "Free"}
                  </Badge>
                  <span className="text-caption">
                    {monthlyLimit.toLocaleString()} certified runs / month
                  </span>
                </div>
                <p className="text-sm text-caption">
                  {activeKeys.length} active API key{activeKeys.length !== 1 ? "s" : ""}
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
                  Billing is currently handled manually. To upgrade or change your plan, 
                  contact us directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <a href="mailto:sales@nexart.io">
                      <Mail className="h-4 w-4 mr-2" />
                      sales@nexart.io
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
                  <strong>Execution is free.</strong> Run the SDK and CLI locally without limits — 
                  no API key required for local execution.
                </p>
                <p>
                  <strong>Certification is what you pay for.</strong> When you need auditable, 
                  reproducible proof that your artwork was executed deterministically, use the 
                  canonical renderer. That's what plans meter.
                </p>
                <p className="text-caption text-sm">
                  Same SDK. Same CLI. Same code. Paid plans unlock assurance, not features.
                </p>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = plan.id === currentPlan;
                return (
                  <Card key={plan.name} className={`flex flex-col ${plan.highlight ? 'border-primary ring-1 ring-primary/20' : ''} ${isCurrent ? 'bg-primary/5' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <Badge variant="outline">{plan.name}</Badge>
                        </div>
                        {plan.highlight && (
                          <Badge variant="default" className="text-xs">Most Popular</Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">
                        {plan.price}
                        {plan.period && (
                          <span className="text-sm font-normal text-caption ml-1">{plan.period}</span>
                        )}
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
                      {plan.note && (
                        <p className="text-xs text-caption italic mt-4">{plan.note}</p>
                      )}
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
                          <a href="mailto:sales@nexart.io">{plan.cta}</a>
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
