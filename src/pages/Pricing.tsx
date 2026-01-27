import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    name: "Free",
    tagline: "Evaluation & CI",
    price: "$0",
    priceDetail: "",
    limit: "100 certified runs / month",
    features: [
      "Full SDK & CLI access",
      "Shared canonical node",
      "Hard cap enforced",
      "No SLA",
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
    ctaAction: "dashboard",
  },
  {
    name: "Pro",
    tagline: "Indie & Early Commercial",
    price: "$3,600",
    priceDetail: "/ year",
    limit: "10,000 certified runs / month",
    features: [
      "Commercial usage licensed",
      "Priority node access",
      "Email support",
    ],
    cta: "Contact",
    ctaVariant: "default" as const,
    ctaAction: "contact",
  },
  {
    name: "Pro+ / Team",
    tagline: "Scaling Teams",
    price: "$12,000",
    priceDetail: "/ year",
    limit: "50,000 certified runs / month",
    features: [
      "Multiple environments",
      "Priority queue",
      "Team management",
    ],
    cta: "Contact",
    ctaVariant: "default" as const,
    ctaAction: "contact",
  },
  {
    name: "Enterprise",
    tagline: "Organization-wide",
    price: "From $50,000",
    priceDetail: "/ year",
    limit: "Contract scope",
    features: [
      "Dedicated or private node",
      "Audit retention",
      "Custom SLAs",
      "Org-wide license",
    ],
    cta: "Talk to Sales",
    ctaVariant: "default" as const,
    ctaAction: "contact",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCta = (action: string) => {
    if (action === "dashboard") {
      navigate(user ? "/dashboard/api-keys" : "/auth");
    } else if (action === "contact") {
      navigate("/contact");
    }
  };

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
          <p className="text-lg text-body max-w-3xl mb-8">
            Run locally with the SDK + CLI for free. Use the canonical renderer when you need verifiable, 
            auditable, reproducible proof.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get an API Key</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/builders/cli">CLI Quickstart</Link>
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
            <li>Auditability (snapshot + hashes)</li>
          </ul>
          <div className="bg-muted/50 border border-border rounded-md p-4">
            <p className="text-sm text-foreground">
              <strong>A certified run</strong> = one canonical renderer execution that returns an output PNG 
              plus a signed, verifiable snapshot JSON.
            </p>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">Plans</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
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
                  <Button 
                    variant={plan.ctaVariant}
                    className="w-full mt-6"
                    onClick={() => handleCta(plan.ctaAction)}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Metering Rules */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">Metering rules</h2>
          <p className="text-body mb-2">
            Metering protects shared infrastructure. Caps are explicit. No surprise bills.
          </p>
          <p className="text-body">
            Enterprise usage is governed by contract scope.
          </p>
        </section>

        {/* What we never charge for */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-4">What we never charge for</h2>
          <ul className="list-disc list-inside text-body space-y-1">
            <li>SDK download</li>
            <li>CLI usage</li>
            <li>Local runs</li>
            <li>Deterministic execution itself</li>
            <li>Recānon verification</li>
          </ul>
        </section>

        {/* Upgrade Philosophy */}
        <section className="mb-8">
          <h2 className="text-2xl font-serif text-foreground mb-4">Upgrade philosophy</h2>
          <p className="text-body">
            Same SDK. Same CLI. Same code. Paid plans unlock assurance, not features. 
            No refactor required to upgrade.
          </p>
        </section>

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-border">
          <div className="flex gap-3 flex-wrap">
            <Button asChild>
              <Link to={user ? "/dashboard/api-keys" : "/auth"}>Get an API Key</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/builders/cli">CLI Quickstart</Link>
            </Button>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Pricing;
