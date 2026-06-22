import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = getSiteUrl();

  try {
    const providerError = searchParams.get("error_description") || searchParams.get("error");
    if (providerError) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(providerError)}`);
    }

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const nextParam = searchParams.get("next");
    const next =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : type === "recovery"
          ? "/reset-password?recovery=1"
          : "/";

    const supabase = await createClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
      }
      if (nextParam) {
        return NextResponse.redirect(`${baseUrl}${next}`);
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return NextResponse.redirect(`${baseUrl}/login`);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .single();
      return NextResponse.redirect(`${baseUrl}${profile?.is_admin ? "/admin" : "/"}`);
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as
          | "signup"
          | "invite"
          | "magiclink"
          | "recovery"
          | "email_change"
          | "email"
          | "phone_change",
      });
      if (error) {
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
      }
      return NextResponse.redirect(`${baseUrl}${next}`);
    }

    return NextResponse.redirect(`${baseUrl}/login?error=missing_callback_token`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication callback failed.";
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(message)}`);
  }
}
