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
        <h1 className="text-2xl font-extrabold text-[#352B24]">Adresat dhe Dergesa</h1>
        <p className="mt-1 text-sm text-[#7c614f]">Kjo adrese perdoret automatikisht kur fitoni nje ankand.</p>
      </div>
      <ProfileCompletionCard user={user} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-[#f0d9c4] bg-white/85 p-6 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <ProfileForm user={user} />
        </div>
        <aside className="rounded-3xl border border-[#f0d9c4] bg-white/85 p-6 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <MapPin className="h-8 w-8 text-[#df6b2e]" />
          <h2 className="mt-4 text-lg font-black text-[#352B24]">Si perdoret adresa?</h2>
          <p className="mt-3 text-sm leading-6 text-[#6f5a4b]">
            Pas perfundimit te ankandit, sistemi krijon porosine me keto te dhena. Ju mund ta rishikoni adresen ne porosi perpara se administratori ta kaloje ne procesim.
          </p>
        </aside>
      </div>
    </div>
  );
}

