import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

export function createClient() {
  const env = getSupabaseEnv();
  return createBrowserClient(
    env.url,
    env.publishableKey
  );
}
