"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { AlertCircle, ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { BrandLogo } from "@/app/components/BrandUi";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <div className="brand-surface relative flex min-h-screen flex-col items-center justify-center p-4 text-[#352B24]">
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-1.5 text-xs font-bold text-[#6f5b4c] transition-colors hover:text-[#D96C2D]">
        <ArrowLeft className="h-4 w-4" />
        <span>Kthehu pas</span>
      </Link>

      <div className="flex w-full max-w-md flex-col gap-6 rounded-[28px] border border-[#f0d9c4] bg-white/90 p-8 text-left shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F7D8B5] bg-[#F7D8B5] text-[#D96C2D]">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wide text-[#352B24]">Regjistrohu ne AuctionSq</h2>
          <p className="text-xs leading-5 text-[#6f5b4c]">Krijo nje llogari falas per te filluar ofertimin.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
            Emri & Mbiemri
            <input type="text" name="fullName" required placeholder="Filan Fisteku" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
            Adresa email
            <input type="email" name="email" required placeholder="emri@shembull.com" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
            Fjalekalimi
            <input type="password" name="password" required placeholder="Min. 6 karaktere" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
          </label>

          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          {state?.success && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <button type="submit" disabled={isPending} className="mt-2 w-full rounded-xl bg-[#D96C2D] py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_12px_28px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520] disabled:opacity-60">
            {isPending ? "Duke regjistruar..." : "Regjistrohu tani"}
          </button>
        </form>

        <div className="border-t border-[#f0d9c4] pt-4 text-center text-xs text-[#6f5b4c]">
          Keni tashme nje llogari?{" "}
          <Link href="/login" className="font-black text-[#D96C2D] hover:text-[#bf5520]">
            Identifikohu ketu
          </Link>
        </div>
      </div>
    </div>
  );
}

