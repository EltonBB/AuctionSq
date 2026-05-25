"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gavel, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 relative">
      <Link
        href="/login"
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
            Rikthe Fjalëkalimin
          </h2>
          <p className="text-slate-450 text-xs">
            Shkruani email-in tuaj dhe ne do t&apos;ju dërgojmë një link për të ndryshuar fjalëkalimin.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col gap-3 text-center items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Email u dërgua!</h4>
            <p className="text-slate-450 text-xs leading-relaxed">
              Ju lutemi kontrolloni kutinë tuaj të mesazheve (Inbox) për udhëzime të mëtejshme.
            </p>
            <Link
              href="/login"
              className="mt-3 px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Kthehu te Hyrja
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-2xs uppercase font-semibold">Adresa Email</label>
              <input
                type="email"
                required
                placeholder="emri@shembull.com"
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 mt-2"
            >
              Dërgo Linkun e Rikthimit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
