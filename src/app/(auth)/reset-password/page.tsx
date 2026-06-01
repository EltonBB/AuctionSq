"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Gavel, AlertCircle } from "lucide-react";
import { requestPasswordReset, updatePassword } from "@/app/actions/auth";

function Message({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;

  const success = !!state?.success;
  return (
    <div
      className={`p-3 rounded-xl flex items-start gap-2 text-xs leading-relaxed ${
        success
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border border-red-500/20 text-red-500"
      }`}
    >
      {success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 relative">
      <Link href="/login" className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Kthehu pas</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-900 rounded-3xl p-8 flex flex-col gap-6 shadow-xl text-left relative overflow-hidden">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
            <Gavel className="w-6 h-6 transform -rotate-45" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            {isRecovery ? "Vendos Fjalekalim te Ri" : "Rikthe Fjalekalimin"}
          </h2>
          <p className="text-slate-450 text-xs">
            {isRecovery
              ? "Vendos fjalekalimin e ri per llogarine tende."
              : "Shkruaj email-in dhe do te dergojme nje link rikuperimi."}
          </p>
        </div>

        {isRecovery ? (
          <form action={updateAction} className="flex flex-col gap-4">
            <Message state={updateState} />
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-2xs uppercase font-semibold">Fjalekalimi i ri</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-2xs uppercase font-semibold">Konfirmo fjalekalimin</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={updatePending}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 mt-2"
            >
              {updatePending ? "Duke ruajtur..." : "Perditeso Fjalekalimin"}
            </button>
          </form>
        ) : (
          <form action={requestAction} className="flex flex-col gap-4">
            <Message state={requestState} />
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-2xs uppercase font-semibold">Adresa Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="emri@shembull.com"
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={requestPending}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 mt-2"
            >
              {requestPending ? "Duke derguar..." : "Dergo Linkun e Rikthimit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
