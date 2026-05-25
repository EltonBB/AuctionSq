import React from "react";
import { runAuctionCloser } from "@/app/actions/admin";
import { ShieldCheck, TimerReset, Truck } from "lucide-react";

export const revalidate = 0;

export default function AdminSettingsPage() {
  async function closeExpiredAuctions() {
    "use server";
    await runAuctionCloser();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Operational settings and manual maintenance tools for pre-production testing.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Trust model</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Only admins can create products and auctions. Buyers can bid after profile completion.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Truck className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Order flow</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Orders move from pending confirmation through fulfillment and delivery.</p>
        </div>
        <form action={closeExpiredAuctions} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <TimerReset className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Auction closer</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Close expired auctions and create winner orders for testing.</p>
          <button className="mt-4 rounded-xl bg-[#082047] px-4 py-3 text-xs font-black uppercase text-white">Run now</button>
        </form>
      </div>
    </div>
  );
}
