"use client";

import React, { useState, useTransition, useEffect } from "react";
import { placeBid } from "@/app/actions/bids";
import { AlertCircle, CheckCircle2, Gavel, User, KeyRound, Ban } from "lucide-react";
import Link from "next/link";

interface BiddingFormProps {
  auctionId: string;
  currentPrice: number;
  minIncrement: number;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  isBlocked: boolean;
  hasBids: boolean;
  startingPrice: number;
}

export default function BiddingForm({
  auctionId,
  currentPrice,
  minIncrement,
  isLoggedIn,
  isProfileComplete,
  isBlocked,
  hasBids,
  startingPrice
}: BiddingFormProps) {
  const defaultMinBid = hasBids ? currentPrice + minIncrement : startingPrice;
  const [bidValue, setBidValue] = useState<number>(defaultMinBid);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset bid input when currentPrice changes (e.g. someone else placed a bid)
  useEffect(() => {
    setBidValue(defaultMinBid);
  }, [currentPrice, defaultMinBid]);

  const handleQuickAdd = (inc: number) => {
    setBidValue((prev) => Math.max(prev, defaultMinBid) + inc);
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (bidValue < defaultMinBid) {
      setError(`Ofertat e vlefshme duhet të jenë të paktën Leka ${defaultMinBid.toLocaleString()}`);
      return;
    }

    startTransition(async () => {
      const res = await placeBid(auctionId, bidValue);
      if (res.success) {
        setSuccess(res.message || "Bidi juaj u vendos me sukses!");
        // Auto clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(res.error || "Ndodhi një gabim gjatë vendosjes së ofertës.");
      }
    });
  };

  // State: Suspended/Blocked user
  if (isLoggedIn && isBlocked) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex flex-col gap-3 text-left">
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <Ban className="w-5 h-5 flex-shrink-0" />
          <span>Llogaria Juaj Është e Pezulluar</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Administratorët kanë kufizuar llogarinë tuaj nga kryerja e ofertave për shkak të shkeljes së rregullores ose sjelljeve të dyshimta.
        </p>
      </div>
    );
  }

  // State: Guest/Unauthenticated
  if (!isLoggedIn) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md">
        <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm uppercase">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Kërkohet Hyrje në Llogari</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Për të vendosur oferta dhe marrë pjesë në ankande të kontrolluara, duhet të krijoni një llogari ose të hyni në llogarinë tuaj.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <Link
            href="/login"
            className="flex items-center justify-center py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold hover:bg-slate-900 transition-colors text-xs uppercase"
          >
            Hyni
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs uppercase shadow shadow-blue-500/10"
          >
            Regjistrohu
          </Link>
        </div>
      </div>
    );
  }

  // State: Logged-in profile incomplete
  if (!isProfileComplete) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md">
        <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm uppercase">
          <User className="w-4.5 h-4.5 text-rose-400" />
          <span>Plotësoni Profilin tuaj</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Për të parandaluar ofertat abuzive, duhet të plotësoni adresën tuaj dhe numrin e telefonit përpara se të ofroni.
        </p>
        <Link
          href="/dashboard/profile"
          className="w-full text-center py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors mt-1 shadow-lg shadow-rose-500/15"
        >
          Plotëso Adresën e Dërgimit
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex flex-col gap-5 text-left shadow-lg">
      <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
        <Gavel className="w-4 h-4 text-blue-500 transform -rotate-45" />
        <span>Vendos Oferten Tënde</span>
      </div>

      <form onSubmit={handleBidSubmit} className="flex flex-col gap-4">
        {/* Bid Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 text-xs uppercase font-medium">Bidi i Ri (në Llek)</label>
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-850 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all flex items-center">
            <input
              type="number"
              value={bidValue}
              onChange={(e) => setBidValue(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={isPending}
              className="bg-transparent pl-4 pr-16 py-3.5 w-full text-lg font-black text-white focus:outline-none placeholder:text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 font-extrabold text-xs text-slate-500 uppercase tracking-widest pointer-events-none">
              Llek
            </span>
          </div>
          <span className="text-slate-500 text-2xs uppercase mt-0.5">
            Bidi minimal i lejuar: <span className="font-extrabold text-slate-400">{defaultMinBid.toLocaleString()} Llek</span>
          </span>
        </div>

        {/* Quick Add buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[`+${minIncrement.toLocaleString()}`, `+${(minIncrement * 2).toLocaleString()}`, `+${(minIncrement * 5).toLocaleString()}`].map((label, idx) => {
            const multi = [1, 2, 5][idx];
            return (
              <button
                type="button"
                key={idx}
                disabled={isPending}
                onClick={() => handleQuickAdd(minIncrement * multi)}
                className="py-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white font-black text-2xs uppercase tracking-wider transition-colors"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2 text-red-500 text-xs leading-relaxed animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-2 text-emerald-400 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-indigo-850 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 scale-100 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {isPending ? "Duke Procesuar..." : "Vendos Ofertën Tani"}
        </button>
      </form>
    </div>
  );
}
