import React from "react";
import Link from "next/link";
import { getSimulatedUser, getBidsByUser } from "@/lib/db";
import { Gavel, Eye } from "lucide-react";

export const revalidate = 0;

export default async function MyBidsPage() {
  const user = await getSimulatedUser();
  const bids = await getBidsByUser(user.id);

  // Group bids by auction to show each listing exactly once
  const groupedBidsMap = new Map<string, typeof bids[0]>();
  bids.forEach((bid) => {
    const existing = groupedBidsMap.get(bid.auction_id);
    if (!existing || existing.amount < bid.amount) {
      groupedBidsMap.set(bid.auction_id, bid);
    }
  });

  const uniqueBids = Array.from(groupedBidsMap.values());

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Ofertat e Mia</h1>
        <p className="text-slate-400 text-sm mt-1">Lista e plotë e ankandeve ku ju keni vendosur oferta.</p>
      </div>

      {uniqueBids.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <Gavel className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk keni asnjë ofertë aktive</h3>
          <p className="text-slate-500 text-sm">Gjeni produkte fantastike dhe filloni ofertimin tuaj.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
            Shfleto Ankande Aktive
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/10 border border-slate-900 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-350">
              <thead className="bg-slate-950/60 border-b border-slate-900 text-slate-400 font-extrabold uppercase tracking-wider text-3xs">
                <tr>
                  <th scope="col" className="px-6 py-4">Produkti</th>
                  <th scope="col" className="px-6 py-4">Bidi Juaj Më i Lartë</th>
                  <th scope="col" className="px-6 py-4">Ofertë Aktive</th>
                  <th scope="col" className="px-6 py-4 text-center">Gjendja</th>
                  <th scope="col" className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {uniqueBids.map((bid) => {
                  const isAuctionActive = bid.auction?.status === "active";
                  const isHighest = bid.amount === bid.auction?.current_price;
                  
                  let badgeLabel = "";
                  let badgeStyle = "";

                  if (!isAuctionActive) {
                    badgeLabel = "Mbyllur";
                    badgeStyle = "bg-slate-800 text-slate-450";
                  } else if (isHighest) {
                    badgeLabel = "Në Udhëheqje";
                    badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                  } else {
                    badgeLabel = "Tej-kaluar";
                    badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/25";
                  }

                  return (
                    <tr key={bid.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          <span className="truncate">{bid.auction?.product?.title}</span>
                          <span className="text-3xs text-slate-500 lowercase">
                            ID: {bid.auction_id.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-200">
                        {bid.amount.toLocaleString()} Llek
                      </td>
                      <td className="px-6 py-4 font-extrabold text-emerald-400">
                        {bid.auction?.current_price.toLocaleString()} Llek
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-3xs font-semibold uppercase ${badgeStyle}`}>
                          {badgeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/auctions/${bid.auction_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Shiko</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
