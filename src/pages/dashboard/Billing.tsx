import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, Building } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For personal projects and experimentation",
    limit: "100 certified runs/month",
    icon: Zap,
    features: [
      "SDK & CLI access",
      "Local execution (unlimited)",
      "100 certified runs/month",
      "Community support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professional creators and small teams",
    limit: "10,000 certified runs/month",
    icon: Zap,
    features: [
      "Everything in Free",
      "10,000 certified runs/month",
      "Priority support",
      "Extended audit logs",
    ],
    cta: "Request Upgrade",
    disabled: false,
  },
  {
    name: "Pro+",
    price: "$99",
    period: "/month",
    description: "For teams with higher volume needs",
    limit: "100,000 certified runs/month",
    icon: Users,
    features: [
      "Everything in Pro",
      "100,000 certified runs/month",
      "Team management",
      "SSO integration",
    ],
    cta: "Request Upgrade",
    disabled: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with custom requirements",
    limit: "1,000,000+ certified runs/month",
    icon: Building,
    features: [
      "Everything in Pro+",
      "Custom volume limits",
      "Dedicated support",
      "Custom SLA",
      "On-premise options",
    ],
    cta: "Contact Sales",
    disabled: false,
  },
];

export default function Billing() {
  const handleUpgradeRequest = (planName: string) => {
    const subject = encodeURIComponent(`NexArt Plan Upgrade Request: ${planName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI would like to upgrade to the ${planName} plan.\n\nPlease contact me to discuss the details.\n\nThank you.`
    );
    window.location.href = `mailto:support@nexart.io?subject=${subject}&body=${body}`;
  };

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
                <strong>Execution is free.</strong> You can run the NexArt SDK and CLI locally
                without limits—no API key required for local execution.
              </p>
              <p>
                <strong>Certification is what's metered.</strong> When you need an auditable,
                reproducible proof that your artwork was executed deterministically, you use the
                certified renderer. That's what plans are for.
              </p>
              <p className="text-caption text-sm">
                Plans unlock assurance, not features. The SDK, CLI, and protocol are always free.
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
                      <span className="text-sm font-normal text-caption">{plan.period}</span>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm font-medium mb-4">{plan.limit}</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button
                      className="w-full"
                      variant={plan.disabled ? "outline" : "default"}
                      disabled={plan.disabled}
                      onClick={() => handleUpgradeRequest(plan.name)}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* What's Never Charged */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Always Free</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 md:grid-cols-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  SDK usage and integration
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  CLI installation and commands
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Local execution (unlimited)
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Protocol specification access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Community forums and docs
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  GitHub issues and discussions
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
