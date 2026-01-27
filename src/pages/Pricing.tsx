import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    tagline: "Evaluation & CI",
    price: "$0",
    priceDetail: "",
    limit: "100 certified runs / month",
    features: [
      "Shared canonical node",
      "Hard cap",
      "No SLA",
    ],
    note: "Not intended for production.",
    cta: "Start Free",
    ctaAction: "dashboard",
    highlight: false,
  },
  {
    name: "Pro",
    tagline: "Serious Indie & Startups",
    price: "$6,000",
    priceDetail: "/ year",
    limit: "~5,000 certified runs / month",
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
    name: "Pro+ / Team",
    tagline: "Cushion Tier",
    price: "$18,000",
    priceDetail: "/ year",
    limit: "~50,000 certified runs / month",
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
    name: "Enterprise",
    tagline: "Infrastructure Dependency",
    price: "From $50,000",
    priceDetail: "/ year",
    limit: "Unlimited (by contract scope)",
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

const Pricing = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <Helmet>
        <title>Pricing — NexArt Protocol</title>
        <meta
          name="description"
          content="Deterministic execution is free. Certified determinism is what you pay for. NexArt certification-based pricing."
        />
      </Helmet>

      <PageHeader
        title="Pricing"
        subtitle="Deterministic execution is free. Certified determinism is what you pay for."
      />

      <PageContent>
        {/* Hero Section */}
        <section className="mb-16">
          <p className="text-lg text-body max-w-3xl mb-4">
            Run deterministic systems locally using the SDK and CLI at no cost.
          </p>
          <p className="text-lg text-body max-w-3xl mb-8">
            When you need verifiable, auditable, reproducible guarantees, certification is provided 
            via the canonical renderer.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get an API Key</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/builders/quickstart">CLI Quickstart</Link>
            </Button>
          </div>
        </section>

        {/* What you're paying for */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">What you're paying for</h2>
          <p className="text-body mb-4">
            We do not charge for execution. We charge for <strong>certification</strong>:
          </p>
          <ul className="list-disc list-inside text-body space-y-1 mb-6">
            <li>Canonical execution proof</li>
            <li>Reproducibility guarantees</li>
            <li>Audit-ready snapshots and hashes</li>
          </ul>
          <div className="bg-muted/50 border border-border rounded-md p-4">
            <p className="text-sm text-foreground">
              <strong>A certified run</strong> is one canonical renderer execution that returns a 
              deterministic PNG and a verifiable snapshot (<code>.snapshot.json</code>).
            </p>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Plans</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`flex flex-col ${plan.highlight ? 'border-primary ring-1 ring-primary/20' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.highlight && (
                      <Badge variant="default" className="text-xs">Most Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                    {plan.priceDetail && (
                      <span className="text-body ml-1">{plan.priceDetail}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-4 pb-4 border-b border-border">
                    {plan.limit}
                  </p>
                  <ul className="space-y-2 text-sm text-body flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.note && (
                    <p className="text-xs text-caption italic mt-4">{plan.note}</p>
                  )}
                  <Button 
                    variant={plan.ctaAction === "dashboard" ? "outline" : "default"}
                    className="w-full mt-6"
                    asChild
                  >
                    <Link to={plan.ctaAction === "dashboard" ? (user ? "/dashboard/api-keys" : "/auth") : "/contact"}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Metering Rules */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Metering rules</h2>
          <p className="text-body mb-4">
            Metering exists to protect shared infrastructure — not to maximize revenue.
          </p>
          <ul className="list-disc list-inside text-body space-y-1">
            <li>Explicit caps for Free / Pro / Pro+</li>
            <li>No surprise bills</li>
            <li>Enterprise usage governed by contract</li>
          </ul>
        </section>

        {/* What we never charge for */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">What we never charge for</h2>
          <ul className="list-disc list-inside text-body space-y-1">
            <li>SDK</li>
            <li>CLI</li>
            <li>Local execution</li>
            <li>Deterministic computation itself</li>
            <li>Recānon verification</li>
          </ul>
        </section>

        {/* Upgrade Philosophy */}
        <section className="mb-8">
          <h2 className="text-2xl font-serif text-foreground mb-4">Upgrade philosophy</h2>
          <p className="text-body mb-2">
            Same SDK. Same CLI. Same code.
          </p>
          <p className="text-body">
            Paid plans unlock assurance, not features. No refactor required.
          </p>
        </section>

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-border">
          <div className="flex gap-3 flex-wrap">
            <Button asChild>
              <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get an API Key</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/builders/quickstart">CLI Quickstart</Link>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Pricing;
