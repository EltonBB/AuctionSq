"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, BadgeCheck, Ban, CheckCircle2, Gavel, KeyRound, User } from "lucide-react";
import { placeBid } from "@/app/actions/bids";
import { allToEur, formatEurFromAll } from "@/lib/currency";

interface BiddingFormProps {
  auctionId: string;
  currentPrice: number;
  minIncrement: number;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  isAccountVerified: boolean;
  isBlocked: boolean;
  hasBids: boolean;
  startingPrice: number;
}

export default function BiddingForm({
  auctionId,
  currentPrice,
  minIncrement,
  isAdmin,
  isLoggedIn,
  isProfileComplete,
  isAccountVerified,
  isBlocked,
  hasBids,
  startingPrice,
}: BiddingFormProps) {
  const defaultMinBidAll = hasBids ? currentPrice + minIncrement : startingPrice;
  const defaultMinBidEur = allToEur(defaultMinBidAll);
  const minIncrementEur = allToEur(minIncrement);
  const [bidValueEur, setBidValueEur] = useState<number>(defaultMinBidEur);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBidValueEur(defaultMinBidEur);
  }, [defaultMinBidEur]);

  const handleQuickAdd = (increment: number) => {
    setBidValueEur((previous) => Math.max(previous, defaultMinBidEur) + increment);
  };

  const handleBidSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (bidValueEur < defaultMinBidEur) {
      setError(`Oferta duhet te jete te pakten ${formatEurFromAll(defaultMinBidAll)}.`);
      return;
    }

    startTransition(async () => {
      const response = await placeBid(auctionId, bidValueEur);
      if (!response.success) {
        setError(response.error || "Vendosja e ofertes deshtoi.");
        return;
      }

      setSuccess(response.message || "Oferta u vendos me sukses.");
      setTimeout(() => setSuccess(null), 5000);
    });
  };

  if (isLoggedIn && isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-left">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-300">
          <Ban className="h-4 w-4" />
          Llogari administratori
        </div>
      </div>
    );
  }

  if (isLoggedIn && isBlocked) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-left">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-red-400">
          <Ban className="h-4 w-4" />
          Llogaria eshte kufizuar
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Kjo llogari nuk mund te vendose oferta derisa kufizimi te hiqet nga administratori.
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-400">
          <KeyRound className="h-4 w-4" />
          Duhet hyrje ne llogari
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Hyni ose regjistrohuni per te vendosur oferta ne ankand.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-center text-xs font-bold uppercase text-slate-300 transition hover:bg-slate-900"
          >
            Hyni
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold uppercase text-white transition hover:bg-blue-700"
          >
            Regjistrohu
          </Link>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-left">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-rose-400">
          <User className="h-4 w-4" />
          Ploteso profilin
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Vendos telefonin, qytetin dhe adresen e dergeses para se te ofrosh.
        </p>
        <Link
          href="/profile"
          className="mt-4 block rounded-xl bg-rose-600 py-3 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-rose-700"
        >
          Ploteso profilin
        </Link>
      </div>
    );
  }

  if (!isAccountVerified) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-left">
        <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-300">
          <BadgeCheck className="h-4 w-4" />
          Llogaria duhet verifikuar
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Vetem perdoruesit me email te verifikuar mund te vendosin oferta.
        </p>
        <Link
          href="/profile"
          className="mt-4 block rounded-xl bg-amber-600 py-3 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-amber-700"
        >
          Hap profilin
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 text-left shadow-lg">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-400">
        <Gavel className="h-4 w-4 -rotate-45 text-blue-500" />
        Vendos oferten
      </div>

      <form onSubmit={handleBidSubmit} className="mt-4 grid gap-4">
        <div className="grid gap-1.5">
            <label className="text-xs font-medium uppercase text-slate-500">Shuma ne EUR</label>
          <div className="relative flex items-center overflow-hidden rounded-xl border border-slate-850 bg-slate-950 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30">
            <input
              type="number"
              step="0.01"
              value={bidValueEur}
              onChange={(event) => setBidValueEur(Math.max(0, parseFloat(event.target.value) || 0))}
              disabled={isPending}
              className="w-full bg-transparent py-3.5 pl-4 pr-14 text-lg font-black text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute right-4 text-xs font-extrabold uppercase tracking-widest text-slate-500">
              EUR
            </span>
          </div>
          <span className="text-2xs uppercase text-slate-500">
              Minimumi i lejuar: <span className="font-extrabold text-slate-300">{formatEurFromAll(defaultMinBidAll)}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 5].map((multiplier) => (
            <button
              key={multiplier}
              type="button"
              disabled={isPending}
              onClick={() => handleQuickAdd(minIncrementEur * multiplier)}
              className="rounded-lg border border-slate-850 bg-slate-950 py-2.5 text-2xs font-black uppercase tracking-wider text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              +{(minIncrementEur * multiplier).toFixed(2)}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-relaxed text-red-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-indigo-850"
        >
          {isPending ? "Duke procesuar..." : "Vendos oferten"}
        </button>
      </form>
    </div>
  );
}
