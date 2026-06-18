import React from "react";
import Link from "next/link";
import { getCurrentUserProfile, getOrdersByUser } from "@/lib/db";
import SafeImage from "@/app/components/SafeImage";
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
    pending_confirmation: "bg-amber-50 text-amber-700 border border-amber-200",
    confirmed: "bg-sky-50 text-sky-700 border border-sky-200",
    processing: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    out_for_delivery: "bg-purple-50 text-purple-700 border border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200"
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-[#352B24]">Ankandet e Fituara</h1>
        <p className="text-[#7c614f] text-sm mt-1">Lista e produkteve ku shpalleni fitues ne ankand.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white/85 rounded-3xl border border-[#f0d9c4] flex flex-col items-center gap-3 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <Award className="w-16 h-16 text-[#e7a77c]" />
          <h3 className="font-bold text-[#352B24] text-lg">Nuk keni ende asnje fitore</h3>
          <p className="text-[#7c614f] text-sm">Vazhdoni te ofroni ne ankandet tona aktive per te fituar produktet tuaja te preferuara.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-[#df6b2e] hover:bg-[#c85f28] text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
            Shko te Ankandet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white/85 border border-[#f0d9c4] p-5 rounded-2xl flex flex-col gap-4 shadow-[0_18px_45px_rgba(98,56,28,0.08)]"
            >
              <div className="aspect-[16/9] w-full rounded-xl bg-[#fff7ed] overflow-hidden relative border border-[#f0d9c4]">
                <SafeImage
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
                <span className="text-[#df6b2e] text-xs font-semibold uppercase">Fituar</span>
                <h3 className="font-bold text-[#352B24] text-base leading-tight truncate">{order.auction?.product?.title}</h3>
                <span className="text-[#9b7b66] text-2xs uppercase">Cmimi i Ofertes Fituese</span>
                <span className="text-lg font-black text-emerald-700">{order.final_price.toLocaleString()} Llek</span>
              </div>

              <div className="border-t border-[#f0d9c4] pt-4 flex gap-3 mt-auto">
                <Link
                  href="/dashboard/orders"
                  className="flex-grow text-center py-2.5 rounded-xl bg-[#df6b2e] hover:bg-[#c85f28] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
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

