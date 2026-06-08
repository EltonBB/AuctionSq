"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  redirect(profile?.is_admin ? "/admin" : "/dashboard");
}

export async function signUp(prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");

  if (!email || !password || !fullName) {
    return { success: false, error: "All fields are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, message: "Registration successful! Check your email if confirmation is enabled." };
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
  const email = String(formData.get("email") || "");
  if (!email) return { success: false, error: "Email is required." };

  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const redirectTo = `${baseUrl}/auth/callback?next=/reset-password?recovery=1`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { success: false, error: error.message };

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
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: error.message };

  return { success: true, message: "Password updated successfully." };
}
