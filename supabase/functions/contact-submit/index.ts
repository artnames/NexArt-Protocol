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

// Simple in-memory rate limiter (per runtime instance, best-effort)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute cooldown per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastSubmit = rateLimitMap.get(ip);
  if (lastSubmit && now - lastSubmit < RATE_LIMIT_WINDOW_MS) {
    return true;
  }
  rateLimitMap.set(ip, now);
  // Prevent unbounded growth — prune old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, ts] of rateLimitMap) {
      if (now - ts > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
    }
  }
  return false;
}

// Basic email validation regex (RFC 5321 practical subset)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// Escape HTML special characters to prevent injection in email body
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Best-effort IP extraction for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";

    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "RATE_LIMIT", message: "Please wait before submitting again" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    // Validate and enforce max lengths
    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const message = body.message?.trim() || "";
    const company = body.company?.trim() || "";

    if (!name || name.length > 80) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Name is required and must be 80 characters or fewer" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "A valid email address is required (max 254 characters)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!message || message.length > 4000) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Message is required and must be 4000 characters or fewer" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (company.length > 100) {
      return new Response(
        JSON.stringify({ error: "VALIDATION", message: "Company name must be 100 characters or fewer" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const timestamp = new Date().toISOString();
    const planInterest = body.planInterest || "Not specified";
    const safeCompany = company || "Not provided";

    // Escape all user-provided fields before embedding in email
    const emailBody = `
New Contact Form Submission
============================

From: ${escapeHtml(name)}
Email: ${escapeHtml(email)}
Company: ${escapeHtml(safeCompany)}

Plan Interest: ${escapeHtml(planInterest)}
Submitted: ${timestamp}
Page: ${escapeHtml(body.pageUrl || "Unknown")}

Message:
--------
${escapeHtml(message)}

============================
This is an automated message from the NexArt contact form.
    `.trim();

    console.log("Sending contact email to sales@artnames.io");
    console.log("From:", email, "| Plan interest:", planInterest);

    const { data, error } = await resend.emails.send({
      from: "NexArt Contact <noreply@nexart.io>",
      to: ["sales@artnames.io"],
      reply_to: email,
      subject: `[NexArt Contact] ${escapeHtml(name)}${company ? ` - ${escapeHtml(company)}` : ""}`,
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
