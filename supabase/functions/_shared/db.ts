// Shared database connection for Railway Postgres
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

export function getDb() {
  const databaseUrl = Deno.env.get("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
}

export function getPlanLimits(plan: string): number {
  const limits: Record<string, number> = {
    free: 100,
    pro: 10000,
    team: 100000,
    enterprise: 1000000,
  };
  return limits[plan] || 100;
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `nx_live_${hex}`;
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
