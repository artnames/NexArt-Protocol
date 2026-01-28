import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  pageUrl: string;
  planInterest?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "CONFIG", message: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const body: ContactRequest = await req.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!body.email?.trim() || !body.email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!body.message?.trim()) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const timestamp = new Date().toISOString();
    const planInterest = body.planInterest || "Not specified";
    const company = body.company?.trim() || "Not provided";

    // Build plain-text email
    const emailBody = `
New Contact Form Submission
============================

From: ${body.name.trim()}
Email: ${body.email.trim()}
Company: ${company}

Plan Interest: ${planInterest}
Submitted: ${timestamp}
Page: ${body.pageUrl}

Message:
--------
${body.message.trim()}

============================
This is an automated message from the NexArt contact form.
    `.trim();

    console.log("Sending contact email to sales@artnames.io");
    console.log("From:", body.email, "| Plan interest:", planInterest);

    const { data, error } = await resend.emails.send({
      from: "NexArt Contact <cloudsbyarrotu@gmail.com>",
      to: ["sales@artnames.io"],
      reply_to: body.email.trim(),
      subject: `[NexArt Contact] ${body.name.trim()}${body.company ? ` - ${body.company}` : ""}`,
      text: emailBody,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "EMAIL", message: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", data?.id);

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Contact submit error:", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL", message: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
