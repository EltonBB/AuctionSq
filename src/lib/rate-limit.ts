import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

interface RateLimitRule {
  action: string;
  limit: number;
  windowSeconds: number;
  keyParts: Array<string | number | boolean | null | undefined>;
  includeIp?: boolean;
  message?: string;
}

interface RateLimitRpcResult {
  allowed: boolean;
  attempt_count: number;
  remaining: number;
  reset_at: string;
}

export interface RateLimitExceeded {
  success: false;
  error: string;
  retryAfterSeconds: number;
}

export function normalizeRateLimitValue(value: string) {
  return value.trim().toLowerCase();
}

async function getRequestIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const vercelForwardedFor = headerStore.get("x-vercel-forwarded-for");
  const cfConnectingIp = headerStore.get("cf-connecting-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    vercelForwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfConnectingIp?.trim() ||
    "unknown"
  );
}

function hashLimitKey(parts: Array<string | number | boolean | null | undefined>) {
  const normalizedParts = parts
    .map((part) => String(part ?? "").trim().toLowerCase())
    .filter(Boolean);

  return createHash("sha256").update(normalizedParts.join("|")).digest("hex");
}

export async function enforceRateLimits(rules: RateLimitRule[]): Promise<RateLimitExceeded | null> {
  if (process.env.DISABLE_APP_RATE_LIMITS === "true") {
    return null;
  }

  const requestIp = await getRequestIp();
  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.warn(
      `Rate limit checks disabled because the admin Supabase client is unavailable: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return null;
  }

  for (const rule of rules) {
    const keyParts = rule.includeIp === false ? rule.keyParts : [...rule.keyParts, "ip", requestIp];
    const limitKey = hashLimitKey(keyParts);
    const { data, error } = await adminClient
      .rpc("check_app_rate_limit", {
        p_action: rule.action,
        p_limit_key: limitKey,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
      })
      .single<RateLimitRpcResult>();

    if (error || !data) {
      console.warn(`Rate limit check failed for ${rule.action}: ${error?.message || "no data"}`);
      continue;
    }

    if (!data.allowed) {
      const resetAt = new Date(data.reset_at).getTime();
      const retryAfterSeconds = Number.isFinite(resetAt)
        ? Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
        : rule.windowSeconds;

      return {
        success: false,
        error: rule.message || "Too many requests. Please try again shortly.",
        retryAfterSeconds,
      };
    }
  }

  return null;
}
