"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConnected, getSimulatedUser, updateProfileMemory, setSimulatedUserRole } from "@/lib/db";

// Helper action to change roles in the local sandbox simulation
export async function switchSimulatedRole(role: string) {
  await setSimulatedUserRole(role);
  revalidatePath("/", "layout");
  return { success: true, message: `Rolet u ndryshuan në: ${role.toUpperCase()}` };
}

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  if (!isSupabaseConnected()) {
    // Local sandbox signin simulation
    if (email.includes("admin")) {
      await setSimulatedUserRole("admin");
    } else if (email.includes("incomplete")) {
      await setSimulatedUserRole("incomplete");
    } else {
      await setSimulatedUserRole("complete");
    }
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { success: false, error: "All fields are required." };
  }

  if (!isSupabaseConnected()) {
    await setSimulatedUserRole("complete");
    return { success: true, message: "Registration successful in local sandbox! Redirecting..." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Registration successful! You can now log in." };
}

export async function signOut() {
  if (!isSupabaseConnected()) {
    await setSimulatedUserRole("guest");
    revalidatePath("/", "layout");
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfile(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const country = formData.get("country") as string || "Albania";
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;

  if (!fullName || !phoneNumber || !city || !address) {
    return { success: false, error: "All profile fields are required to enable bidding." };
  }

  if (!isSupabaseConnected()) {
    const user = await getSimulatedUser();
    await updateProfileMemory(user.id, fullName, phoneNumber, city, address);
    // If the role was incomplete, auto-upgrade it to complete now that profile details are present!
    await setSimulatedUserRole("complete");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { success: true, message: "Të dhënat u përditësuan me sukses në sandbox!" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
      country,
      city,
      address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { success: true, message: "Profile successfully updated!" };
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "Password fields cannot be empty." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (!isSupabaseConnected()) {
    return { success: true, message: "Fjalëkalimi u ndryshua me sukses (Sandbox)!" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Password updated successfully!" };
}
