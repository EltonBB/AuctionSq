import React from "react";
import Link from "next/link";
import { updateOrderStatus } from "@/app/actions/admin";
import { getOrders } from "@/lib/db";

export const revalidate = 0;

const statuses = ["pending_confirmation", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  async function updateStatus(formData: FormData) {
    "use server";
    await updateOrderStatus(String(formData.get("orderId")), String(formData.get("status")));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Orders Management</h1>
        <p className="mt-1 text-sm text-slate-500">Track winners, delivery addresses, payment amount, and fulfillment status.</p>
      </div>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.auction?.product?.images?.[0]} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <Link href={`/auctions/${order.auction_id}`} className="font-black text-blue-700">{order.auction?.product?.title}</Link>
                  <p className="mt-1 text-sm text-slate-500">Winner: {order.winner?.full_name} · {order.phone_number}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.city}, {order.address}</p>
                  <p className="mt-2 text-lg font-black">{order.final_price.toLocaleString()} L</p>
                </div>
              </div>
              <form action={updateStatus} className="grid gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                <select name="status" defaultValue={order.status} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                </select>
                <button className="rounded-xl bg-[#082047] px-4 py-2 text-xs font-black uppercase text-white">Update status</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
