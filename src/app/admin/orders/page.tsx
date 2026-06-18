import React from "react";
import Link from "next/link";
import { getOrders } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import AdminOrderStatusForm from "@/app/components/AdminOrderStatusForm";
import SafeImage from "@/app/components/SafeImage";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = (await getOrders()).filter((order) => !["delivered", "cancelled"].includes(order.status));

  return (
    <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Menaxhimi i Porosive</h1>
        <p className="mt-1 text-sm text-[#8a7565]">Ndiq fituesit, adresat dhe statusin e permbushjes.</p>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-4 text-sm text-[#8a7565]">
            Nuk ka porosi ne proces per momentin.
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-[#f0d9c4] p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="flex gap-4">
                  <SafeImage
                    src={order.auction?.product?.images?.[0]}
                    alt={order.auction?.product?.title || "Produkt"}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div>
                    <Link href={`/auctions/${order.auction_id}`} className="font-black text-[#D96C2D]">
                      {order.auction?.product?.title}
                    </Link>
                    <p className="mt-1 text-sm text-[#8a7565]">
                      Fituesi: {order.winner?.full_name} - {order.phone_number}
                    </p>
                    <p className="mt-1 text-sm text-[#8a7565]">
                      {order.city}, {order.address}
                    </p>
                    <p className="mt-2 text-lg font-black">{formatEurFromAll(order.final_price)}</p>
                  </div>
                </div>

                <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}


