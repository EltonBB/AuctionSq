import React from "react";
import { ProfileCompletionCard, ProfileForm } from "@/app/components/AccountForms";
import { getCurrentUserProfile } from "@/lib/db";
import { MapPin } from "lucide-react";

export const revalidate = 0;

export default async function AddressesPage() {
  const user = await getCurrentUserProfile();

  return (
    <div className="grid gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Adresat dhe Dergesa</h1>
        <p className="mt-1 text-sm text-slate-400">Kjo adrese perdoret automatikisht kur fitoni nje ankand.</p>
      </div>
      <ProfileCompletionCard user={user} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
          <ProfileForm user={user} />
        </div>
        <aside className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
          <MapPin className="h-8 w-8 text-blue-400" />
          <h2 className="mt-4 text-lg font-black text-white">Si perdoret adresa?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pas perfundimit te ankandit, sistemi krijon porosine me keto te dhena. Ju mund ta rishikoni adresen ne porosi perpara se administratori ta kaloje ne procesim.
          </p>
        </aside>
      </div>
    </div>
  );
}

