export interface SupabaseEnv {
  url: string;
  publishableKey: string;
  serviceRoleKey?: string;
}

function isInvalid(value: string | undefined) {
  if (!value) return true;
  return value.includes("placeholder") || value.includes("your-project");
}

export function getSupabaseEnv(options?: { requireServiceRole?: boolean }): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (isInvalid(url)) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (isInvalid(publishableKey)) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (options?.requireServiceRole && isInvalid(serviceRoleKey)) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing or invalid Supabase env vars: ${missing.join(", ")}`);
  }

  return {
    url: url as string,
    publishableKey: publishableKey as string,
    serviceRoleKey: serviceRoleKey || undefined,
  };
}
