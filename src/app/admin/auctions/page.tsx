import React from "react";
import { AuctionCreateForm } from "@/app/components/AdminForms";
import { cancelAuction, relistAuction } from "@/app/actions/admin";
import { getAuctions, getProducts } from "@/lib/db";

export const revalidate = 0;

export default async function AdminAuctionsPage() {
  const [auctions, products] = await Promise.all([getAuctions(), getProducts()]);

  async function cancel(formData: FormData) {
    "use server";
    await cancelAuction(String(formData.get("auctionId")));
  }

  async function relist(formData: FormData) {
    "use server";
    await relistAuction(String(formData.get("auctionId")), String(formData.get("startTime")), String(formData.get("endTime")), Number(formData.get("startingPrice")));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Auctions</h1>
          <p className="mt-1 text-sm text-slate-500">Active, scheduled, ended, cancelled, and relisted auctions.</p>
        </div>
        <div className="grid gap-4">
          {auctions.map((auction) => (
            <div key={auction.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-lg font-black text-slate-950">{auction.product?.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(auction.start_time).toLocaleString()} - {new Date(auction.end_time).toLocaleString()}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-md bg-slate-100 px-2 py-1">{auction.status}</span>
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Current {auction.current_price.toLocaleString()} L</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1">Start {auction.starting_price.toLocaleString()} L</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  {auction.status !== "cancelled" && auction.status !== "ended" && (
                    <form action={cancel}>
                      <input type="hidden" name="auctionId" value={auction.id} />
                      <button className="w-full rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50">Cancel</button>
                    </form>
                  )}
                  {["ended", "cancelled"].includes(auction.status) && (
                    <form action={relist} className="grid gap-2 rounded-xl bg-slate-50 p-3">
                      <input type="hidden" name="auctionId" value={auction.id} />
                      <input name="startingPrice" type="number" defaultValue={auction.starting_price} className="rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                      <input name="startTime" type="datetime-local" className="rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                      <input name="endTime" type="datetime-local" className="rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                      <button className="rounded-lg bg-[#082047] px-3 py-2 text-xs font-black text-white">Relist</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <AuctionCreateForm products={products} />
    </div>
  );
}
