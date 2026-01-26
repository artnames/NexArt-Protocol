import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    tagline: "Evaluation & CI",
    price: "$0",
    features: [
      "Full SDK & CLI",
      "Shared canonical node",
      "100 certified runs / month",
      "No SLA",
      "Hard cap",
    ],
    note: "Not intended for production.",
  },
  {
    name: "Pro",
    tagline: "Indie & Early Commercial",
    price: "$3,600 / year",
    features: [
      "Commercial CodeMode usage",
      "Priority node access",
      "5,000–10,000 certified runs / month",
      "Email support",
    ],
  },
  {
    name: "Pro+ / Team",
    tagline: "Scaling Teams",
    price: "$12,000 / year",
    features: [
      "~50,000 certified runs / month",
      "Multiple environments",
      "Priority queue",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Organization-wide",
    price: "From $50,000 / year",
    features: [
      "Org-wide license",
      "Dedicated or private node",
      "Audit retention",
      "SLAs",
    ],
  },
];

const Pricing = () => {
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
        <article className="prose-protocol prose-spec">
          <p className="text-lg text-body mb-12">
            NexArt lets you run deterministic systems locally for free using the SDK and CLI.
            When you need verifiable, auditable, reproducible guarantees, certification is provided 
            via the canonical renderer.
          </p>

          <h2>What you're paying for</h2>
          <p>
            We do not charge for execution. We charge for <strong>certification</strong>: 
            auditability, reproducibility, and canonical proof.
          </p>
          <p>
            The SDK and CLI are always free.
          </p>
        </article>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 my-12">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-2xl font-semibold text-foreground">{plan.price}</p>
                <ul className="space-y-2 text-sm text-body">
                  {plan.features.map((feature, i) => (
                    <li key={i}>• {feature}</li>
                  ))}
                </ul>
                {plan.note && (
                  <p className="text-xs text-caption italic">{plan.note}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <article className="prose-protocol prose-spec">
          <h2>Metering Rules</h2>
          <p>
            Metering exists to protect infrastructure — not to maximize revenue. 
            Free and paid plans include clear caps and quotas.
          </p>
          <p>
            Enterprise usage is governed by contract.
          </p>

          <h2>What we never charge for</h2>
          <ul>
            <li>SDK</li>
            <li>CLI</li>
            <li>Local execution</li>
            <li>Deterministic runs</li>
            <li>Recānon verification</li>
          </ul>

          <h2>Upgrade Philosophy</h2>
          <p>
            Same SDK. Same CLI. Same code. Paid plans unlock assurance, not features.
          </p>
          <p>
            No refactor required to upgrade.
          </p>
        </article>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-serif text-foreground mb-4">Get started</h2>
          <div className="flex gap-3 flex-wrap">
            <Button asChild>
              <Link to="/contact">Get an API Key</Link>
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
