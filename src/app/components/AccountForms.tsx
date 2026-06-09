"use client";

import React, { useActionState } from "react";
import { updatePassword, updateProfile } from "@/app/actions/auth";
import type { Profile } from "@/lib/db";
import { AlertCircle, CheckCircle2, Lock, MapPin, User } from "lucide-react";

function ActionMessage({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;

  return (
    <div className={`rounded-xl border p-3 text-xs ${state?.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      <div className="flex items-start gap-2">
        {state?.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>{state?.message || state?.error}</span>
      </div>
    </div>
  );
}

export function ProfileForm({ user, compact = false }: { user: Profile; compact?: boolean }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="grid gap-4">
      <ActionMessage state={state} />
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
          Emri i plote
          <input name="fullName" defaultValue={user.full_name} required className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
          Telefoni
          <input name="phoneNumber" defaultValue={user.phone_number} required className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
          Shteti
          <input name="country" defaultValue={user.country || "Albania"} required className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
          Qyteti
          <input name="city" defaultValue={user.city} required className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
        </label>
      </div>
      <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
        Adresa e dergeses
        <textarea name="address" defaultValue={user.address} required rows={4} className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#df6b2e] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#c85f28] disabled:opacity-60">
        <User className="h-4 w-4" />
        {isPending ? "Duke ruajtur..." : "Ruaj profilin"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, null);

  return (
    <form action={formAction} className="grid gap-4">
      <ActionMessage state={state} />
      <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
        Fjalekalimi i ri
        <input name="password" type="password" required minLength={6} className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
      </label>
      <label className="grid gap-1.5 text-xs font-bold text-[#7c614f]">
        Konfirmo fjalekalimin
        <input name="confirmPassword" type="password" required minLength={6} className="rounded-xl border border-[#efcfb5] bg-white px-4 py-3 text-sm text-[#352B24] outline-none transition focus:border-[#df6b2e] focus:ring-2 focus:ring-[#df6b2e]/15" />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#df6b2e] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#c85f28] disabled:opacity-60">
        <Lock className="h-4 w-4" />
        {isPending ? "Duke ndryshuar..." : "Ndrysho fjalekalimin"}
      </button>
    </form>
  );
}

export function ProfileCompletionCard({ user }: { user: Profile }) {
  const hasAddressData = !!user.full_name && !!user.phone_number && !!user.city && !!user.address;
  const canBid = hasAddressData && !!user.email_verified;

  return (
    <div className={`rounded-2xl border p-5 ${canBid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-start gap-3">
        <MapPin className={`mt-1 h-5 w-5 ${canBid ? "text-emerald-600" : "text-amber-600"}`} />
        <div>
          <h3 className="font-black text-[#352B24]">{canBid ? "Profili eshte gati per ofertim" : "Plotesoni profilin per te ofruar"}</h3>
          <p className="mt-1 text-sm leading-6 text-[#6f5a4b]">
            {canBid
              ? "Te dhenat e kontaktit dhe verifikimi i emailit jane ne rregull. Llogaria mund te vendose oferta."
              : "Per te mbrojtur ankandet, cdo perdorues duhet te plotesoje profilin dhe te konfirmoje emailin perpara ofertimit."}
          </p>
        </div>
      </div>
    </div>
  );
}

