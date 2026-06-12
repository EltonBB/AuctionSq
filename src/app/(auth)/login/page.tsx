"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signInWithGoogle } from "@/app/actions/auth";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { BrandLogo } from "@/app/components/BrandUi";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

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
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wide text-[#352B24]">Hyni ne NjeKlik</h2>
          <p className="text-xs leading-5 text-[#6f5b4c]">Vendosni email-in dhe fjalekalimin per te hyre ne llogarine tuaj.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
            Adresa email
            <input type="email" name="email" required placeholder="emri@shembull.com" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
          </label>

          <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
            <span className="flex items-center justify-between">
              Fjalekalimi
              <Link href="/reset-password" className="text-[11px] normal-case text-[#D96C2D] hover:text-[#bf5520]">
                Harruat fjalekalimin?
              </Link>
            </span>
            <input type="password" name="password" required placeholder="--------" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
          </label>

          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <button type="submit" disabled={isPending} className="mt-2 w-full rounded-xl bg-[#D96C2D] py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_12px_28px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520] disabled:opacity-60">
            {isPending ? "Duke ju identifikuar..." : "Hyni ne llogari"}
          </button>
        </form>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 text-xs font-bold text-[#a99584]">
            <span className="h-px flex-1 bg-[#f0d9c4]" />
            Ose vazhdo me
            <span className="h-px flex-1 bg-[#f0d9c4]" />
          </div>
          <form action={signInWithGoogle}>
            <button type="submit" className="brand-focus flex w-full items-center justify-center gap-3 rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm font-black text-[#352B24] transition hover:border-[#D96C2D] hover:text-[#D96C2D]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-[#4285F4] shadow-[inset_0_0_0_1px_#e5e7eb]">G</span>
              Vazhdo me Google
            </button>
          </form>
        </div>

        <div className="border-t border-[#f0d9c4] pt-4 text-center text-xs text-[#6f5b4c]">
          Nuk keni ende llogari?{" "}
          <Link href="/register" className="font-black text-[#D96C2D] hover:text-[#bf5520]">
            Regjistrohu tani
          </Link>
        </div>
      </div>
    </div>
  );
}

