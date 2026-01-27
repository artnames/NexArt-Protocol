import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Evaluation & CI",
    limit: "100 certified runs / month",
    icon: Zap,
    features: [
      "Full SDK & CLI access",
      "Shared canonical node",
      "Hard cap enforced",
      "No SLA",
    ],
    cta: "Current Plan",
    ctaAction: "none",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$3,600",
    period: "/ year",
    description: "Indie & Early Commercial",
    limit: "10,000 certified runs / month",
    icon: Zap,
    features: [
      "Commercial usage licensed",
      "Priority node access",
      "Email support",
    ],
    cta: "Contact",
    ctaAction: "contact",
    highlight: false,
  },
  {
    name: "Pro+ / Team",
    price: "$12,000",
    period: "/ year",
    description: "Scaling Teams",
    limit: "50,000 certified runs / month",
    icon: Users,
    features: [
      "Multiple environments",
      "Priority queue",
      "Team management",
    ],
    cta: "Contact",
    ctaAction: "contact",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "From $50,000",
    period: "/ year",
    description: "Organization-wide",
    limit: "Contract scope",
    icon: Building,
    features: [
      "Dedicated or private node",
      "Audit retention",
      "Custom SLAs",
      "Org-wide license",
    ],
    cta: "Talk to Sales",
    ctaAction: "contact",
    highlight: false,
  },
];

export default function Billing() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-caption">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Billing | NexArt Dashboard</title>
        <meta name="description" content="Manage your NexArt subscription and view pricing plans." />
      </Helmet>
      
      <DashboardLayout title="Billing">
        <div className="space-y-6">
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
              return (
                <Card key={plan.name} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" />
                      <Badge variant="outline">{plan.name}</Badge>
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
                  </CardContent>
                  <div className="p-6 pt-0">
                    {plan.ctaAction === "none" ? (
                      <Button className="w-full" variant="outline" disabled>
                        {plan.cta}
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link to="/contact">{plan.cta}</Link>
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
      </DashboardLayout>
    </>
  );
}
