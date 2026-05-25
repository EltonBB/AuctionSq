"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Gavel, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kthehu pas</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-900 rounded-3xl p-8 flex flex-col gap-6 shadow-xl text-left relative overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
            <Gavel className="w-6 h-6 transform -rotate-45" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            Regjistrohu ne AuctionSq
          </h2>
          <p className="text-slate-450 text-xs">
            Krijo një llogari falas për të filluar ofertimin në produktet tona.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 text-2xs uppercase font-semibold">Emri & Mbiemri</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Filan Fisteku"
              className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-550 text-2xs uppercase font-semibold">Fjalëkalimi</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Min. 6 karaktere"
              className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2 text-red-500 text-xs leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2 text-emerald-400 text-xs leading-relaxed">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 mt-2"
          >
            {isPending ? "Duke regjistruar..." : "Regjistrohu Tani"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-900 pt-4 mt-2">
          Keni tashmë një llogari?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">
            Identifikohu këtu
          </Link>
        </div>
      </div>
    </div>
  );
}
