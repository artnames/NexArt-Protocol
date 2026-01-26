import { supabase } from "@/integrations/supabase/client";

export interface ApiKey {
  id: string;
  label: string;
  plan: string;
  status: string;
  monthly_limit: number;
  created_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
}

export interface UsageSummary {
  period: string;
  total: number;
  success: number;
  errors: number;
  avg_duration_ms: number;
}

export interface UsageEvent {
  id: string;
  created_at: string;
  endpoint: string;
  status_code: number;
  duration_ms: number;
  error_code: string | null;
  key_label: string;
}

export interface ProvisionKeyResponse {
  apiKey: string;
  apiKeyId: string;
  monthlyLimit: number;
  plan: string;
  label: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function provisionKey(plan: string = "free", label: string = "Default Key"): Promise<ProvisionKeyResponse> {
  const { data, error } = await supabase.functions.invoke("provision-key", {
    body: { plan, label },
  });

  if (error) {
    throw new Error(error.message || "Failed to provision key");
  }

  return data as ProvisionKeyResponse;
}

export async function listKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase.functions.invoke("list-keys");

  if (error) {
    throw new Error(error.message || "Failed to list keys");
  }

  return data.keys as ApiKey[];
}

export async function rotateKey(keyId: string): Promise<ProvisionKeyResponse> {
  const { data, error } = await supabase.functions.invoke("rotate-key", {
    body: { keyId },
  });

  if (error) {
    throw new Error(error.message || "Failed to rotate key");
  }

  return data as ProvisionKeyResponse;
}

export async function revokeKey(keyId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("revoke-key", {
    body: { keyId },
  });

  if (error) {
    throw new Error(error.message || "Failed to revoke key");
  }
}

export async function getUsageSummary(period: "today" | "month"): Promise<UsageSummary> {
  const { data, error } = await supabase.functions.invoke("usage-summary", {
    body: {},
    headers: {
      "x-period": period,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to get usage summary");
  }

  return data as UsageSummary;
}

export async function getUsageSummaryByPeriod(period: "today" | "month"): Promise<UsageSummary> {
  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/usage-summary`);
  url.searchParams.set("period", period);
  
  const headers = await getAuthHeaders();
  
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get usage summary");
  }

  return response.json();
}

export async function getRecentUsage(): Promise<UsageEvent[]> {
  const { data, error } = await supabase.functions.invoke("usage-recent");

  if (error) {
    throw new Error(error.message || "Failed to get recent usage");
  }

  return data.events as UsageEvent[];
}
