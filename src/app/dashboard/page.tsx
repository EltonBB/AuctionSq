import React from "react";
import Link from "next/link";
import { getCurrentUserProfile, getBidsByUser, getOrdersByUser } from "@/lib/db";
import { Gavel, Award, ShoppingBag, Truck, ArrowRight, Package } from "lucide-react";

export const revalidate = 0;

export default async function DashboardOverviewPage() {
  const user = await getCurrentUserProfile();
  const bids = await getBidsByUser(user.id);
  const orders = await getOrdersByUser(user.id);

  // Stats calculation
  const activeBids = bids.filter((b) => b.status === "active");
  const uniqueAuctionBids = Array.from(new Set(activeBids.map((b) => b.auction_id)));
  
  const wonAuctionsCount = orders.length; // Each order represents a won auction
  const pendingOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "delivered");

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mirëseerdhe, {user.full_name}!</h1>
        <p className="text-slate-400 text-sm mt-1">Ndiqni bidet tuaja aktive, fitimet, dhe gjendjen e dërgesave.</p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Gavel className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <span className="text-slate-500 text-3xs font-extrabold uppercase tracking-wider block">Bide Aktive</span>
            <span className="text-2xl font-black text-white">{uniqueAuctionBids.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 text-3xs font-extrabold uppercase tracking-wider block">Ankande të Fituara</span>
            <span className="text-2xl font-black text-white">{wonAuctionsCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 text-3xs font-extrabold uppercase tracking-wider block">Porosi në Proçes</span>
            <span className="text-2xl font-black text-white">{pendingOrders.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-850 text-slate-400 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-500 text-3xs font-extrabold uppercase tracking-wider block">Porosi të Dorëzuara</span>
            <span className="text-2xl font-black text-white">{completedOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Grid of recent activities split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bids Table preview */}
        <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <h3 className="font-extrabold text-white text-base">Ofertat e Fundit</h3>
            <Link href="/dashboard/bids" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              <span>Shiko të gjitha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeBids.length === 0 ? (
            <div className="text-center py-12 text-slate-550 text-xs flex flex-col items-center gap-2">
              <Gavel className="w-10 h-10 text-slate-800" />
              <span>Nuk keni vendosur ende asnjë ofertë.</span>
              <Link href="/auctions" className="text-blue-400 hover:underline text-xs mt-1">Shfleto ankandet aktive</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bids.slice(0, 4).map((bid) => {
                const isHighest = bid.amount === bid.auction?.current_price;
                return (
                  <div key={bid.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {bid.auction?.product?.title}
                      </span>
                      <span className="text-slate-550 text-3xs">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="font-black text-slate-200">{bid.amount.toLocaleString()} Llek</span>
                      <span className={`px-2 py-0.5 rounded text-3xs font-semibold ${isHighest ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/10 text-amber-400 border border-amber-500/25"}`}>
                        {isHighest ? "Në Krye" : "Tej-kaluar"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders Table preview */}
        <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <h3 className="font-extrabold text-white text-base">Porositë e Fundit</h3>
            <Link href="/dashboard/orders" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              <span>Shiko të gjitha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-550 text-xs flex flex-col items-center gap-2">
              <Package className="w-10 h-10 text-slate-800" />
              <span>Nuk keni ende asnjë porosi të krijuar.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.slice(0, 4).map((order) => {
                const statusLabels: Record<string, string> = {
                  pending_confirmation: "Në Pritje Konfirmimi",
                  confirmed: "Konfirmuar",
                  processing: "Në Proçesim",
                  out_for_delivery: "Nisur me Postë",
                  delivered: "Dorëzuar",
                  cancelled: "Anuluar"
                };

                const statusStyles: Record<string, string> = {
                  pending_confirmation: "bg-amber-500/10 text-amber-400",
                  confirmed: "bg-blue-500/10 text-blue-400",
                  processing: "bg-indigo-500/10 text-indigo-400",
                  out_for_delivery: "bg-purple-500/10 text-purple-400",
                  delivered: "bg-emerald-500/10 text-emerald-400",
                  cancelled: "bg-red-500/10 text-red-400"
                };

                return (
                  <div key={order.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {order.auction?.product?.title}
                      </span>
                      <span className="text-slate-555 text-3xs">
                        Adresa: {order.city}, {order.address}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1 items-end">
                      <span className="font-black text-slate-200">{order.final_price.toLocaleString()} Llek</span>
                      <span className={`px-2 py-0.5 rounded text-3xs font-semibold ${statusStyles[order.status]}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
