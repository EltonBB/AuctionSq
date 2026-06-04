import React from "react";
import Link from "next/link";
import { cancelBid } from "@/app/actions/admin";
import { ConfirmSubmitButton } from "@/app/components/AdminUi";
import { getAuctions, getBidsForAuction } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";

export const revalidate = 0;

export default async function AdminBidsPage() {
  const auctions = await getAuctions();
  const bids = (await Promise.all(auctions.map((auction) => getBidsForAuction(auction.id).then((items) => items.map((bid) => ({ ...bid, auction })))))).flat();
  async function cancel(formData: FormData) {
    "use server";
    await cancelBid(String(formData.get("bidId") || ""), String(formData.get("reason") || ""));
  }

  return (
    <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Monitorimi i Ofertave</h1>
        <p className="mt-1 text-sm text-[#8a7565]">Monitoro historikun dhe anulo ofertat e dyshimta me arsyetim.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[#f0d9c4] text-xs uppercase text-[#8a7565]">
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
                <td className="py-4"><Link href={`/auctions/${bid.auction_id}`} className="font-bold text-[#D96C2D]">{bid.auction.product?.title}</Link></td>
                <td>{bid.user.full_name}</td>
                <td className="font-black">{formatEurFromAll(bid.amount)}</td>
                <td><span className={`rounded-md px-2 py-1 text-xs font-bold ${bid.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{bid.status}</span></td>
                <td className="text-[#8a7565]">{new Date(bid.created_at).toLocaleString()}</td>
                <td>
                  {bid.status === "active" ? (
                    <form action={cancel} className="flex gap-2">
                      <input type="hidden" name="bidId" value={bid.id} />
                      <input name="reason" placeholder="Arsyeja e anulimit" className="w-44 rounded-lg border border-[#f0d9c4] px-3 py-2 text-xs" />
                      <ConfirmSubmitButton
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50"
                        confirmMessage="Anulo kete oferte?"
                      >
                        Anulo
                      </ConfirmSubmitButton>
                    </form>
                  ) : (
                    <span className="text-xs text-[#8a7565]">{bid.cancelled_reason || "Anuluar"}</span>
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



