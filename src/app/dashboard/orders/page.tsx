import React from "react";
import Link from "next/link";
import { getCurrentUserProfile, getOrdersByUser } from "@/lib/db";
import OrderAddressForm from "@/app/components/OrderAddressForm";
import PollingRefresh from "@/app/components/PollingRefresh";
import { ShoppingBag, Calendar, CheckCircle2, Circle, MapPin } from "lucide-react";

export const revalidate = 0;

export default async function MyOrdersPage() {
  const user = await getCurrentUserProfile();
  const orders = await getOrdersByUser(user.id);

  // Status translate map
  const statusLabels: Record<string, string> = {
    pending_confirmation: "Ne Pritje Konfirmimi",
    confirmed: "Konfirmuar",
    processing: "Ne Procesim",
    out_for_delivery: "Nisur me Poste",
    delivered: "Dorezuar",
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

  // Progression steps to map a beautiful timeline
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "pending_confirmation", label: "Konfirmimi" },
      { key: "confirmed", label: "Konfirmuar" },
      { key: "processing", label: "Procesim" },
      { key: "out_for_delivery", label: "Posta" },
      { key: "delivered", label: "Dorezuar" }
    ];

    if (status === "cancelled") {
      return [{ key: "cancelled", label: "Anuluar", active: true, done: false }];
    }

    const currentIndex = steps.findIndex(s => s.key === status);
    
    return steps.map((s, idx) => ({
      ...s,
      active: idx === currentIndex,
      done: idx < currentIndex
    }));
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <PollingRefresh intervalMs={15000} />
      <div>
        <h1 className="text-2xl font-extrabold text-white">Porosite e Mia</h1>
        <p className="text-slate-400 text-sm mt-1">Ndiqni progresin e dergesave dhe konfirmoni adresat e dergesave.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <ShoppingBag className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk keni asnje porosi ende</h3>
          <p className="text-slate-500 text-sm">Merrni pjese ne ankande per te siguruar fitoret dhe porosite e para.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
            Shko te Ankandet
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => {
            const steps = getTimelineSteps(order.status);
            const isAddressEditable = ["pending_confirmation", "confirmed"].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-slate-900/30 border border-slate-900 p-6 rounded-3xl flex flex-col gap-6 shadow"
              >
                {/* Header split */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-slate-550 text-3xs font-extrabold uppercase tracking-wider block">ID e Porosise</span>
                    <span className="text-sm font-black text-white">{order.id.substring(0, 18).toUpperCase()}...</span>
                    <span className="text-3xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Krijuar: {new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-slate-500 text-3xs block uppercase">Shuma per te paguar</span>
                      <span className="text-lg font-black text-emerald-400">{order.final_price.toLocaleString()} Llek</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-2xs font-extrabold uppercase tracking-wider ${statusStyles[order.status]}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Product details and Address Form split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Product card info (5 cols) */}
                  <div className="lg:col-span-5 flex items-start gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-900 text-left">
                    <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-850 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.auction?.product?.images?.[0]}
                        alt={order.auction?.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-blue-500 text-3xs font-bold uppercase">Produkt i Fituar</span>
                      <h4 className="font-bold text-white text-sm leading-tight truncate">{order.auction?.product?.title}</h4>
                      <Link
                        href={`/auctions/${order.auction_id}`}
                        className="text-3xs font-bold text-blue-400 hover:text-blue-300 underline"
                      >
                        Shiko Faqen e Ankandit
                      </Link>
                    </div>
                  </div>

                  {/* Shipping address panel (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-3 p-5 rounded-2xl bg-slate-950 border border-slate-900 text-left">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-500 text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>Detajet e Postimit</span>
                      </span>
                      {order.status === "pending_confirmation" && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-3xs font-bold uppercase animate-pulse">
                          Kerkohet Konfirmim Adrese
                        </span>
                      )}
                    </div>

                    <OrderAddressForm
                      orderId={order.id}
                      currentFullName={order.full_name}
                      currentPhone={order.phone_number}
                      currentCity={order.city}
                      currentAddress={order.address}
                    />

                    {!isAddressEditable && (
                      <span className="text-3xs text-slate-500 italic block mt-1">
                        * Adresa nuk mund te ndryshohet pasi porosia ka kaluar ne procesim ose eshte derguar.
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline progress bar */}
                <div className="border-t border-slate-900 pt-5">
                  <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto flex-wrap">
                    {steps.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-3xs font-bold uppercase tracking-wider">
                        {s.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : s.active ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 animate-pulse flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-700 flex-shrink-0" />
                        )}
                        <span className={s.active ? "text-blue-400 font-black" : s.done ? "text-slate-300" : "text-slate-600"}>
                          {s.label}
                        </span>
                        {idx < steps.length - 1 && (
                          <div className={`w-8 h-[2px] hidden sm:block ${s.done ? "bg-emerald-500/30" : "bg-slate-900"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

