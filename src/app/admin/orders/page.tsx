import React from "react";
import Link from "next/link";
import { getOrders } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import AdminOrderStatusForm from "@/app/components/AdminOrderStatusForm";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Menaxhimi i Porosive</h1>
        <p className="mt-1 text-sm text-slate-500">Ndiq fituesit, adresat dhe statusin e permbushjes.</p>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Nuk ka porosi per momentin.
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.auction?.product?.images?.[0]}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div>
                    <Link href={`/auctions/${order.auction_id}`} className="font-black text-blue-700">
                      {order.auction?.product?.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      Fituesi: {order.winner?.full_name} - {order.phone_number}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
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
