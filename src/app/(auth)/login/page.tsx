"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { Gavel, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleAutofill = (role: string) => {
    if (role === "admin") {
      setEmailInput("admin@auctionsq.com");
      setPasswordInput("admin123");
    } else if (role === "incomplete") {
      setEmailInput("incomplete@auctionsq.com");
      setPasswordInput("buyer123");
    } else {
      setEmailInput("buyer@auctionsq.com");
      setPasswordInput("buyer123");
    }
  };

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
            Hyni ne AuctionSq
          </h2>
          <p className="text-slate-450 text-xs">
            Vendosni email-in dhe fjalëkalimin për të hyrë në panelin tuaj.
          </p>
        </div>

        {/* Local sandbox helpers info */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
          <span className="text-amber-500 text-3xs font-extrabold uppercase tracking-wider">
            Sandbox Shortcut (Autofill & Hyr)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAutofill("complete")}
              className="py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 font-semibold text-3xs transition-colors"
            >
              Buyer Complete
            </button>
            <button
              type="button"
              onClick={() => handleAutofill("incomplete")}
              className="py-1 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 text-rose-400 font-semibold text-3xs transition-colors"
            >
              Buyer Incomplete
            </button>
            <button
              type="button"
              onClick={() => handleAutofill("admin")}
              className="py-1 rounded bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/25 text-blue-400 font-semibold text-3xs transition-colors"
            >
              Admin Account
            </button>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 text-2xs uppercase font-semibold">Adresa Email</label>
            <input
              type="email"
              name="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="emri@shembull.com"
              className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-550 text-2xs uppercase font-semibold">Fjalëkalimi</label>
              <Link href="/reset-password" className="text-3xs text-blue-400 hover:text-blue-300">
                Harruat fjalëkalimin?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2 text-red-500 text-xs leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 mt-2"
          >
            {isPending ? "Duke ju identifikuar..." : "Hyni në Llogari"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-900 pt-4 mt-2">
          Nuk keni ende llogari?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold">
            Regjistrohu tani
          </Link>
        </div>
      </div>
    </div>
  );
}
