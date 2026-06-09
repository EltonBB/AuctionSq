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
    pending_confirmation: "bg-amber-50 text-amber-700 border border-amber-200",
    confirmed: "bg-sky-50 text-sky-700 border border-sky-200",
    processing: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    out_for_delivery: "bg-purple-50 text-purple-700 border border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200"
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
        <h1 className="text-2xl font-extrabold text-[#352B24]">Porosite e Mia</h1>
        <p className="text-[#7c614f] text-sm mt-1">Ndiqni progresin e dergesave dhe konfirmoni adresat e dergesave.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white/85 rounded-3xl border border-[#f0d9c4] flex flex-col items-center gap-3 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <ShoppingBag className="w-16 h-16 text-[#e7a77c]" />
          <h3 className="font-bold text-[#352B24] text-lg">Nuk keni asnje porosi ende</h3>
          <p className="text-[#7c614f] text-sm">Merrni pjese ne ankande per te siguruar fitoret dhe porosite e para.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-[#df6b2e] hover:bg-[#c85f28] text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
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
                className="bg-white/85 border border-[#f0d9c4] p-6 rounded-3xl flex flex-col gap-6 shadow-[0_18px_45px_rgba(98,56,28,0.08)]"
              >
                {/* Header split */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0d9c4] pb-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[#9b7b66] text-3xs font-extrabold uppercase tracking-wider block">ID e Porosise</span>
                    <span className="text-sm font-black text-[#352B24]">{order.id.substring(0, 18).toUpperCase()}...</span>
                    <span className="text-3xs text-[#9b7b66] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Krijuar: {new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-[#9b7b66] text-3xs block uppercase">Shuma per te paguar</span>
                      <span className="text-lg font-black text-emerald-700">{order.final_price.toLocaleString()} Llek</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-2xs font-extrabold uppercase tracking-wider ${statusStyles[order.status]}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Product details and Address Form split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Product card info (5 cols) */}
                  <div className="lg:col-span-5 flex items-start gap-4 p-4 rounded-2xl bg-[#fff7ed] border border-[#f0d9c4] text-left">
                    <div className="w-20 h-20 rounded-xl bg-white overflow-hidden relative border border-[#f0d9c4] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.auction?.product?.images?.[0]}
                        alt={order.auction?.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-[#df6b2e] text-3xs font-bold uppercase">Produkt i Fituar</span>
                      <h4 className="font-bold text-[#352B24] text-sm leading-tight truncate">{order.auction?.product?.title}</h4>
                      <Link
                        href={`/auctions/${order.auction_id}`}
                        className="text-3xs font-bold text-[#df6b2e] hover:text-[#c85f28] underline"
                      >
                        Shiko Faqen e Ankandit
                      </Link>
                    </div>
                  </div>

                  {/* Shipping address panel (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-3 p-5 rounded-2xl bg-[#fff7ed] border border-[#f0d9c4] text-left">
                    <div className="flex items-center justify-between border-b border-[#f0d9c4] pb-2">
                      <span className="text-[#7c614f] text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#df6b2e]" />
                        <span>Detajet e Postimit</span>
                      </span>
                      {order.status === "pending_confirmation" && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-3xs font-bold uppercase animate-pulse">
                          Kerkohet Konfirmim Adrese
                        </span>
                      )}
                    </div>

                    <OrderAddressForm
                      orderId={order.id}
                      currentFullName={order.full_name}
                      currentPhone={order.phone_number}
                      currentCountry={order.country}
                      currentCity={order.city}
                      currentAddress={order.address}
                    />

                    {!isAddressEditable && (
                      <span className="text-3xs text-[#9b7b66] italic block mt-1">
                        * Adresa nuk mund te ndryshohet pasi porosia ka kaluar ne procesim ose eshte derguar.
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline progress bar */}
                <div className="border-t border-[#f0d9c4] pt-5">
                  <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto flex-wrap">
                    {steps.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-3xs font-bold uppercase tracking-wider">
                        {s.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : s.active ? (
                          <CheckCircle2 className="w-4 h-4 text-[#df6b2e] animate-pulse flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#d8bca6] flex-shrink-0" />
                        )}
                        <span className={s.active ? "text-[#df6b2e] font-black" : s.done ? "text-[#6f5a4b]" : "text-[#a98972]"}>
                          {s.label}
                        </span>
                        {idx < steps.length - 1 && (
                          <div className={`w-8 h-[2px] hidden sm:block ${s.done ? "bg-emerald-200" : "bg-[#f0d9c4]"}`} />
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

