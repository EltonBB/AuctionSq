"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { requestPasswordReset, updatePassword } from "@/app/actions/auth";
import { BrandLogo } from "@/app/components/BrandUi";

function Message({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;
  const success = !!state?.success;
  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{state.message || state.error}</span>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const isRecovery = searchParams.get("recovery") === "1";

  const [requestState, requestAction, requestPending] = useActionState(requestPasswordReset, null);
  const [updateState, updateAction, updatePending] = useActionState(updatePassword, null);

  return (
    <div className="brand-surface relative flex min-h-screen flex-col items-center justify-center p-4 text-[#352B24]">
      <Link href="/login" className="absolute left-6 top-6 flex items-center gap-1.5 text-xs font-bold text-[#6f5b4c] transition-colors hover:text-[#D96C2D]">
        <ArrowLeft className="h-4 w-4" />
        <span>Kthehu pas</span>
      </Link>

      <div className="flex w-full max-w-md flex-col gap-6 rounded-[28px] border border-[#f0d9c4] bg-white/90 p-8 text-left shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F7D8B5] bg-[#F7D8B5] text-[#D96C2D]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wide text-[#352B24]">
            {isRecovery ? "Vendos fjalekalim te ri" : "Rikthe fjalekalimin"}
          </h2>
          <p className="text-xs leading-5 text-[#6f5b4c]">
            {isRecovery ? "Vendos fjalekalimin e ri per llogarine tende." : "Shkruaj email-in dhe do te dergojme nje link rikuperimi."}
          </p>
        </div>

        {isRecovery ? (
          <form action={updateAction} className="flex flex-col gap-4">
            <Message state={updateState} />
            <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
              Fjalekalimi i ri
              <input type="password" name="password" required minLength={6} className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
            </label>
            <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
              Konfirmo fjalekalimin
              <input type="password" name="confirmPassword" required minLength={6} className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
            </label>
            <button type="submit" disabled={updatePending} className="mt-2 w-full rounded-xl bg-[#D96C2D] py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#bf5520] disabled:opacity-60">
              {updatePending ? "Duke ruajtur..." : "Perditeso fjalekalimin"}
            </button>
          </form>
        ) : (
          <form action={requestAction} className="flex flex-col gap-4">
            <Message state={requestState} />
            <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
              Adresa email
              <input type="email" name="email" required placeholder="emri@shembull.com" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
            </label>
            <button type="submit" disabled={requestPending} className="mt-2 w-full rounded-xl bg-[#D96C2D] py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#bf5520] disabled:opacity-60">
              {requestPending ? "Duke derguar..." : "Dergo linkun e rikthimit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8F1]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

