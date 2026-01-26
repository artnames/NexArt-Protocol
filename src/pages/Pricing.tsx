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
    renders: "1,000",
    support: "Community support",
    description: "Best for experimentation",
  },
  {
    name: "Builder",
    renders: "25,000",
    support: "Higher limits",
    description: "Best for prototypes + small apps",
  },
  {
    name: "Pro",
    renders: "250,000",
    support: "Priority limits",
    description: "Best for production apps",
  },
];

const Pricing = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Pricing — NexArt Protocol</title>
        <meta
          name="description"
          content="Use the canonical renderer as an API to run, verify, and replay deterministic Code Mode outputs."
        />
      </Helmet>

      <PageHeader
        title="Pricing"
        subtitle="Use the canonical renderer as an API to run, verify, and replay deterministic Code Mode outputs."
      />

      <PageContent>
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-body">
                  <li><strong>{plan.renders}</strong> renders / month</li>
                  <li>{plan.support}</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <article className="prose-protocol prose-spec">
          <h2>What counts as usage?</h2>
          <ul>
            <li>1 successful call to <code>POST /api/render</code> = 1 render unit.</li>
            <li>Failed calls may still count (depending on server policy).</li>
          </ul>
        </article>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-serif text-foreground mb-4">Get an API key</h2>
          <p className="text-body mb-6">
            Request access and we'll provision a key. Dashboard is coming next.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild>
              <Link to="/contact">Request API Key</Link>
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
