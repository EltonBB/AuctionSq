"use server";

import { createClient } from "@/lib/supabase/server";
import { enforceRateLimits, normalizeRateLimitValue } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(prevState: unknown, formData: FormData) {
  const email = normalizeRateLimitValue(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const rateLimit = await enforceRateLimits([
    {
      action: "auth:sign-in:ip",
      limit: 30,
      windowSeconds: 15 * 60,
      keyParts: ["sign-in"],
      message: "Too many login attempts. Please try again in a few minutes.",
    },
    {
      action: "auth:sign-in:email",
      limit: 8,
      windowSeconds: 15 * 60,
      keyParts: ["sign-in", email],
      includeIp: false,
      message: "Too many login attempts for this email. Please wait before trying again.",
    },
  ]);
  if (rateLimit) return rateLimit;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  redirect(profile?.is_admin ? "/admin" : "/");
}

export async function signUp(prevState: unknown, formData: FormData) {
  const email = normalizeRateLimitValue(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");

  if (!email || !password || !fullName) {
    return { success: false, error: "All fields are required." };
  }
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const rateLimit = await enforceRateLimits([
    {
      action: "auth:sign-up:ip",
      limit: 5,
      windowSeconds: 60 * 60,
      keyParts: ["sign-up"],
      message: "Too many registration attempts. Please try again later.",
    },
    {
      action: "auth:sign-up:email",
      limit: 3,
      windowSeconds: 24 * 60 * 60,
      keyParts: ["sign-up", email],
      includeIp: false,
      message: "Too many registration attempts for this email. Please try again later.",
    },
  ]);
  if (rateLimit) return rateLimit;

  const supabase = await createClient();
  const baseUrl = getSiteUrl();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, message: "Registration successful! Check your email if confirmation is enabled." };
}

export async function signInWithGoogle() {
  const rateLimit = await enforceRateLimits([
    {
      action: "auth:google:ip",
      limit: 20,
      windowSeconds: 15 * 60,
      keyParts: ["google"],
      message: "Too many Google sign-in attempts. Please try again shortly.",
    },
  ]);
  if (rateLimit) {
    redirect(`/login?error=${encodeURIComponent(rateLimit.error)}`);
  }

  const supabase = await createClient();
  const baseUrl = getSiteUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    const message = error?.message || "Google sign-in is not available right now.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfile(prevState: unknown, formData: FormData) {
  const fullNameRaw = String(formData.get("fullName") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const fullName = fullNameRaw || [firstName, lastName].filter(Boolean).join(" ");
  const phoneNumber = String(formData.get("phoneNumber") || "");
  const country = String(formData.get("country") || "Albania");
  const city = String(formData.get("city") || "");
  const address = String(formData.get("address") || "");
  const postalCode = String(formData.get("postalCode") || "");

  if (!fullName || !phoneNumber || !city || !address) {
    return { success: false, error: "All profile fields are required to enable bidding." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized. Please log in." };

  const rateLimit = await enforceRateLimits([
    {
      action: "profile:update:user",
      limit: 20,
      windowSeconds: 60 * 60,
      keyParts: ["profile-update", user.id],
      includeIp: false,
      message: "Too many profile updates. Please try again later.",
    },
  ]);
  if (rateLimit) return rateLimit;

  const { error } = await supabase.rpc("update_own_profile", {
    p_full_name: fullName,
    p_phone_number: phoneNumber,
    p_country: country,
    p_city: city,
    p_address: address,
    p_postal_code: postalCode || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard/profile");
  revalidatePath("/", "layout");
  return { success: true, message: "Profile successfully updated." };
}

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  const email = normalizeRateLimitValue(String(formData.get("email") || ""));
  if (!email) return { success: false, error: "Email is required." };

  const rateLimit = await enforceRateLimits([
    {
      action: "auth:password-reset:ip",
      limit: 10,
      windowSeconds: 60 * 60,
      keyParts: ["password-reset"],
      message: "Too many recovery requests. Please try again later.",
    },
    {
      action: "auth:password-reset:email",
      limit: 3,
      windowSeconds: 60 * 60,
      keyParts: ["password-reset", email],
      includeIp: false,
      message: "Too many recovery requests for this email. Please try again later.",
    },
  ]);
  if (rateLimit) return rateLimit;

  const supabase = await createClient();
  const baseUrl = getSiteUrl();

  const redirectTo = `${baseUrl}/auth/callback?next=/reset-password?recovery=1`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    return { success: true, message: "If this email is registered, a recovery email will be sent." };
  }

  return { success: true, message: "Recovery email sent. Check your inbox." };
}

export async function updatePassword(prevState: unknown, formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || !confirmPassword) {
    return { success: false, error: "Password fields cannot be empty." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized. Please log in again." };

  const rateLimit = await enforceRateLimits([
    {
      action: "auth:password-update:user",
      limit: 5,
      windowSeconds: 60 * 60,
      keyParts: ["password-update", user.id],
      includeIp: false,
      message: "Too many password updates. Please try again later.",
    },
  ]);
  if (rateLimit) return rateLimit;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: error.message };

  return { success: true, message: "Password updated successfully." };
}
