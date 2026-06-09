import React from "react";
import { ProfileCompletionCard, ProfileForm } from "@/app/components/AccountForms";
import { getCurrentUserProfile } from "@/lib/db";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();

  return (
    <div className="grid gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-[#352B24]">Profili Im</h1>
        <p className="mt-1 text-sm text-[#7c614f]">Menaxhoni identitetin, kontaktin dhe te dhenat qe perdoren per ofertim.</p>
      </div>
      <ProfileCompletionCard user={user} />
      <div className="rounded-3xl border border-[#f0d9c4] bg-white/85 p-6 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}

