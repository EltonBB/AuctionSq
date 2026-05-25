import React from "react";
import Link from "next/link";
import { cancelBid } from "@/app/actions/admin";
import { getAuctions, getBidsForAuction } from "@/lib/db";

export const revalidate = 0;

export default async function AdminBidsPage() {
  const auctions = await getAuctions();
  const bids = (await Promise.all(auctions.map((auction) => getBidsForAuction(auction.id).then((items) => items.map((bid) => ({ ...bid, auction })))))).flat();

  async function cancel(formData: FormData) {
    "use server";
    await cancelBid(String(formData.get("bidId")), String(formData.get("reason") || "Admin moderation"));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Bids Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor live bid history and cancel suspicious or invalid bids with a reason.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3">Auction</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td className="py-4"><Link href={`/auctions/${bid.auction_id}`} className="font-bold text-blue-700">{bid.auction.product?.title}</Link></td>
                <td>{bid.user.full_name}</td>
                <td className="font-black">{bid.amount.toLocaleString()} L</td>
                <td><span className={`rounded-md px-2 py-1 text-xs font-bold ${bid.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{bid.status}</span></td>
                <td className="text-slate-500">{new Date(bid.created_at).toLocaleString()}</td>
                <td>
                  {bid.status === "active" ? (
                    <form action={cancel} className="flex gap-2">
                      <input type="hidden" name="bidId" value={bid.id} />
                      <input name="reason" placeholder="Reason" className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-xs" />
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50">Cancel</button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-400">{bid.cancelled_reason || "Cancelled"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
