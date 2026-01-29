import { supabase } from "@/integrations/supabase/client";

// API Keys are now credentials only - plan/quota enforced at account level
export interface ApiKey {
  id: string;
  label: string;
  status: string;
  created_at: string;
}

export interface AccountPlan {
  plan: string;
  planName: string;
  monthlyLimit: number;
  used: number;
  remaining: number;
  maxKeys: number;
  keysUsed: number;
  keysRemaining: number;
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
  label: string;
}

// Error types for friendly UI messages
export interface ApiError {
  code: string;
  message: string;
  isServiceUnavailable: boolean;
}

export function parseApiError(error: unknown): ApiError {
  const err = error as { message?: string; code?: string };
  const message = err?.message || "An unexpected error occurred";
  const code = err?.code || "UNKNOWN";
  
  // Check for service unavailability patterns
  const isServiceUnavailable = 
    message.toLowerCase().includes("database") ||
    message.toLowerCase().includes("connection") ||
    message.toLowerCase().includes("unavailable") ||
    code === "DB_CONNECTION" ||
    code === "DB_SSL" ||
    code === "CONFIG";

  return {
    code,
    message,
    isServiceUnavailable,
  };
}

export function getFriendlyErrorMessage(error: ApiError): string {
  if (error.isServiceUnavailable) {
    return "Service temporarily unavailable. Please try again in a moment.";
  }
  
  switch (error.code) {
    case "AUTH":
      return "Authentication failed. Please sign in again.";
    case "RATE_LIMIT":
      return "You've reached the maximum number of API keys.";
    case "KEY_LIMIT_REACHED":
      return error.message || "Key limit reached for your plan.";
    case "VALIDATION":
      return error.message;
    case "NOT_FOUND":
      return "The requested resource was not found.";
    default:
      return error.message || "An unexpected error occurred.";
  }
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

async function handleFunctionResponse<T>(
  functionName: string,
  options?: { body?: Record<string, unknown> }
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: options?.body,
  });

  if (error) {
    // Try to extract structured error from function response
    const apiError: ApiError = {
      code: (error as any)?.code || "INTERNAL",
      message: error.message || "Failed to call function",
      isServiceUnavailable: false,
    };
    
    // Check if error contains service unavailability indicators
    if (error.message?.includes("DB") || error.message?.includes("connection")) {
      apiError.isServiceUnavailable = true;
    }
    
    throw apiError;
  }

  // Check if data contains an error structure
  if (data?.error) {
    throw {
      code: data.error,
      message: data.message || "Operation failed",
      isServiceUnavailable: data.error === "DB_CONNECTION" || data.error === "CONFIG",
    } as ApiError;
  }

  return data as T;
}

// Account-level plan (replaces per-key plan logic)
export async function getAccountPlan(): Promise<AccountPlan> {
  return handleFunctionResponse<AccountPlan>("account-plan");
}

export async function provisionKey(label: string = "Default Key"): Promise<ProvisionKeyResponse> {
  return handleFunctionResponse<ProvisionKeyResponse>("provision-key", {
    body: { label },
  });
}

export async function listKeys(): Promise<ApiKey[]> {
  const data = await handleFunctionResponse<{ keys: ApiKey[] }>("list-keys");
  return data.keys;
}

export async function rotateKey(keyId: string): Promise<ProvisionKeyResponse> {
  return handleFunctionResponse<ProvisionKeyResponse>("rotate-key", {
    body: { keyId },
  });
}

export async function revokeKey(keyId: string): Promise<void> {
  await handleFunctionResponse<{ success: boolean }>("revoke-key", {
    body: { keyId },
  });
}

export async function getUsageSummary(period: "today" | "month"): Promise<UsageSummary> {
  return handleFunctionResponse<UsageSummary>("usage-summary", {
    body: {},
  });
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
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: "INTERNAL", message: "Failed to get usage summary" };
    }
    
    throw {
      code: errorData.error || "INTERNAL",
      message: errorData.message || "Failed to get usage summary",
      isServiceUnavailable: errorData.error === "DB_CONNECTION" || errorData.error === "CONFIG",
    } as ApiError;
  }

  return response.json();
}

export async function getRecentUsage(): Promise<UsageEvent[]> {
  const data = await handleFunctionResponse<{ events: UsageEvent[] }>("usage-recent");
  return data.events;
}
