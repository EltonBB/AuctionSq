import React from "react";
import Link from "next/link";
import { getCurrentUserProfile, getOrdersByUser } from "@/lib/db";
import { Award, ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function WonAuctionsPage() {
  const user = await getCurrentUserProfile();
  const orders = await getOrdersByUser(user.id);

  const statusLabels: Record<string, string> = {
    pending_confirmation: "Kerkohet Konfirmim Adrese",
    confirmed: "Adresa u Konfirmua",
    processing: "Duke u Procesuar",
    out_for_delivery: "Nisur me Poste",
    delivered: "Dorezuar me Sukses",
    cancelled: "Anuluar"
  };

  const statusStyles: Record<string, string> = {
    pending_confirmation: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
    confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
    processing: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25",
    out_for_delivery: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
    delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/25"
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Ankandet e Fituara</h1>
        <p className="text-slate-400 text-sm mt-1">Lista e produkteve ku shpalleni fitues ne ankand.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <Award className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk keni ende asnje fitore</h3>
          <p className="text-slate-500 text-sm">Vazhdoni te ofroni ne ankandet tona aktive per te fituar produktet tuaja te preferuara.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
            Shko te Ankandet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl flex flex-col gap-4 shadow"
            >
              <div className="aspect-[16/9] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.auction?.product?.images?.[0]}
                  alt={order.auction?.product?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded text-3xs font-semibold uppercase ${statusStyles[order.status]}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-blue-500 text-xs font-semibold uppercase">Fituar</span>
                <h3 className="font-bold text-white text-base leading-tight truncate">{order.auction?.product?.title}</h3>
                <span className="text-slate-500 text-2xs uppercase">emimi i Ofertes Fituese</span>
                <span className="text-lg font-black text-emerald-400">{order.final_price.toLocaleString()} Llek</span>
              </div>

              <div className="border-t border-slate-900 pt-4 flex gap-3 mt-auto">
                <Link
                  href="/profile"
                  className="flex-grow text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Detajet e Porosise</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

