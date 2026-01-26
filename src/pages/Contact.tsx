import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Request submitted",
        description: "We'll be in touch soon with your API key.",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Request API Key — NexArt Protocol</title>
        <meta
          name="description"
          content="Request an API key to access the NexArt canonical renderer."
        />
      </Helmet>

      <PageHeader
        title="Request API Key"
        subtitle="Fill out this form and we'll provision your API key."
      />

      <PageContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project description</Label>
            <Textarea
              id="project"
              name="project"
              required
              placeholder="Briefly describe your project and use case"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renders">Expected monthly renders</Label>
            <Input
              id="renders"
              name="renders"
              type="text"
              required
              placeholder="e.g., 5,000"
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </PageContent>
    </PageLayout>
  );
};

export default Contact;
