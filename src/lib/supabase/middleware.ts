import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./config";

export async function updateSession(request: NextRequest) {
  let env;
  try {
    env = getSupabaseEnv();
  } catch {
    if (request.nextUrl.pathname !== "/setup-required") {
      const url = request.nextUrl.clone();
      url.pathname = "/setup-required";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.url,
    env.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This is required to refresh session tokens
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  const isAdminRoute = url.pathname.startsWith("/admin");
  const isLegacyDashboardRoute = url.pathname.startsWith("/dashboard");
  const isProfileRoute = url.pathname.startsWith("/profile");

  // 1. Protect user/admin account routes from unauthenticated users
  if ((isLegacyDashboardRoute || isAdminRoute || isProfileRoute) && !user) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  // 2. Redirect logged-in users away from /login and /register
  if (user && (url.pathname.startsWith("/login") || url.pathname.startsWith("/register"))) {
    url.pathname = isAdmin ? "/admin" : "/profile";
    return NextResponse.redirect(url);
  }

  // 3. Remove client panel routes. Keep admin panel only.
  if (user && isLegacyDashboardRoute) {
    url.pathname = isAdmin ? "/admin" : "/profile";
    return NextResponse.redirect(url);
  }

  // 4. Prevent non-admin users from accessing /admin paths
  if (user && isAdminRoute && !isAdmin) {
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
