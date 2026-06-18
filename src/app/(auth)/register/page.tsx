"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signInWithGoogle, signUp } from "@/app/actions/auth";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { AuthBrandHeader, AuthDivider, AuthFooter, AuthShell, AuthTinyTrust, GoogleLogo } from "@/app/components/AuthUi";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <AuthShell>
      <div className="grid gap-7">
        <AuthBrandHeader
          icon={<UserPlus className="h-5 w-5" />}
          title="Krijo profil"
          copy="Hap nje llogari falas per te ruajtur ofertat, fitoret dhe porosite."
        />

        <form action={formAction} className="flex flex-col gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[#6f5b4c]">
            Emri dhe mbiemri
            <input
              type="text"
              name="fullName"
              required
              placeholder="Filan Fisteku"
              className="brand-focus h-12 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-medium text-[#352B24] shadow-sm"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#6f5b4c]">
            Email
            <input
              type="email"
              name="email"
              required
              placeholder="emri@shembull.com"
              className="brand-focus h-12 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-medium text-[#352B24] shadow-sm"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#6f5b4c]">
            Fjalekalimi
            <input
              type="password"
              name="password"
              required
              placeholder="Min. 8 karaktere"
              className="brand-focus h-12 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-medium text-[#352B24] shadow-sm"
            />
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

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-xl bg-[#D96C2D] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520] active:translate-y-px disabled:opacity-60"
          >
            {isPending ? "Duke krijuar profilin..." : "Krijo profil"}
          </button>
        </form>

        <div className="grid gap-4">
          <AuthDivider>Ose krijo profil me</AuthDivider>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="brand-focus flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-black text-[#352B24] shadow-sm transition hover:border-[#D96C2D] hover:text-[#D96C2D] active:translate-y-px"
            >
              <GoogleLogo />
              Vazhdo me Google
            </button>
          </form>
        </div>

        <div className="border-t border-[#f0d9c4] pt-4 text-center text-xs text-[#6f5b4c]">
          Keni tashme nje llogari?{" "}
          <Link href="/login" className="font-black text-[#D96C2D] hover:text-[#bf5520]">
            Kycu ketu
          </Link>
        </div>

        <div className="grid gap-4 text-center">
          <AuthTinyTrust />
          <AuthFooter />
        </div>
      </div>
    </AuthShell>
  );
}
