import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  const env = getSupabaseEnv();

  return createServerClient(
    env.url,
    env.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const env = getSupabaseEnv({ requireServiceRole: true });
  return createServerClient(
    env.url,
    env.serviceRoleKey as string,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
