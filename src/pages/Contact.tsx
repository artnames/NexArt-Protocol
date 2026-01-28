import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import PageContent from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertCircle } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Infer plan interest if coming from pricing page
  const getPlanInterest = (): string | undefined => {
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    if (plan) return plan;
    
    // Check referrer for pricing page
    if (document.referrer.includes("/pricing")) {
      return "From pricing page";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    const message = formData.get("message") as string;

    try {
      const { data, error: fnError } = await supabase.functions.invoke("contact-submit", {
        body: {
          name: name.trim(),
          email: email.trim(),
          company: company?.trim() || undefined,
          message: message.trim(),
          pageUrl: window.location.href,
          planInterest: getPlanInterest(),
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to submit form");
      }

      if (data?.error) {
        throw new Error(data.message || "Failed to submit form");
      }

      setIsSuccess(true);
      toast({
        title: "Message sent",
        description: "Thanks — we'll get back to you shortly.",
      });
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <PageLayout>
        <Helmet>
          <title>Message Sent — NexArt Protocol</title>
        </Helmet>

        <PageHeader
          title="Message Sent"
          subtitle="Thanks — we'll get back to you shortly."
        />

        <PageContent>
          <div className="max-w-md text-center py-12">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <p className="text-body mb-6">
              We've received your message and will respond within 1-2 business days.
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              Send another message
            </Button>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>Contact Us — NexArt Protocol</title>
        <meta
          name="description"
          content="Get in touch with the NexArt team for API access, partnership inquiries, or support."
        />
      </Helmet>

      <PageHeader
        title="Contact Us"
        subtitle="Questions about NexArt? We'd love to hear from you."
      />

      <PageContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              type="text"
              placeholder="Your company (optional)"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              required
              placeholder="Tell us about your project or inquiry"
              rows={5}
              maxLength={2000}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </PageContent>
    </PageLayout>
  );
};

export default Contact;
