import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/db";

export const revalidate = 0;

export default async function DashboardLayout() {
  const user = await getCurrentUserProfile();
  if (user.id === "usr-guest") {
    redirect("/login");
  }

  if (user.is_admin) {
    redirect("/admin");
  }

  redirect("/profile");
}
