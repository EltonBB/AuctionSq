"use client";

import React, { useActionState } from "react";
import { updatePassword, updateProfile } from "@/app/actions/auth";
import type { Profile } from "@/lib/db";
import { AlertCircle, CheckCircle2, Lock, MapPin, User } from "lucide-react";

function ActionMessage({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;

  return (
    <div className={`rounded-xl border p-3 text-xs ${state?.success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
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
        <label className="grid gap-1.5 text-xs font-bold text-slate-400">
          Emri i plote
          <input name="fullName" defaultValue={user.full_name} required className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-400">
          Telefoni
          <input name="phoneNumber" defaultValue={user.phone_number} required className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-400">
          Shteti
          <input name="country" defaultValue={user.country || "Albania"} required className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-slate-400">
          Qyteti
          <input name="city" defaultValue={user.city} required className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
        </label>
      </div>
      <label className="grid gap-1.5 text-xs font-bold text-slate-400">
        Adresa e dergeses
        <textarea name="address" defaultValue={user.address} required rows={4} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-700 disabled:opacity-60">
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
      <label className="grid gap-1.5 text-xs font-bold text-slate-400">
        Fjalekalimi i ri
        <input name="password" type="password" required minLength={6} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
      </label>
      <label className="grid gap-1.5 text-xs font-bold text-slate-400">
        Konfirmo fjalekalimin
        <input name="confirmPassword" type="password" required minLength={6} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-700 disabled:opacity-60">
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
    <div className={`rounded-2xl border p-5 ${canBid ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10"}`}>
      <div className="flex items-start gap-3">
        <MapPin className={`mt-1 h-5 w-5 ${canBid ? "text-emerald-300" : "text-amber-300"}`} />
        <div>
          <h3 className="font-black text-white">{canBid ? "Profili eshte gati per ofertim" : "Plotesoni profilin per te ofruar"}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {canBid
              ? "Te dhenat e kontaktit dhe verifikimi i emailit jane ne rregull. Llogaria mund te vendose oferta."
              : "Per te mbrojtur ankandet, cdo perdorues duhet te plotesoje profilin dhe te konfirmoje emailin perpara ofertimit."}
          </p>
        </div>
      </div>
    </div>
  );
}
