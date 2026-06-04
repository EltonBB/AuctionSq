import React from "react";
import { ProfileCompletionCard, ProfileForm } from "@/app/components/AccountForms";
import { getCurrentUserProfile } from "@/lib/db";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();

  return (
    <div className="grid gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Profili Im</h1>
        <p className="mt-1 text-sm text-slate-400">Menaxhoni identitetin, kontaktin dhe te dhenat qe perdoren per ofertim.</p>
      </div>
      <ProfileCompletionCard user={user} />
      <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}

