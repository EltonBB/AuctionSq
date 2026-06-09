import React from "react";
import Link from "next/link";
import { getCurrentUserProfile, getBidsByUser } from "@/lib/db";
import PollingRefresh from "@/app/components/PollingRefresh";
import { Gavel, Eye } from "lucide-react";

export const revalidate = 0;

export default async function MyBidsPage() {
  const user = await getCurrentUserProfile();
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
      <PollingRefresh intervalMs={15000} />
      <div>
        <h1 className="text-2xl font-extrabold text-[#352B24]">Ofertat e Mia</h1>
        <p className="text-[#7c614f] text-sm mt-1">Lista e plote e ankandeve ku ju keni vendosur oferta.</p>
      </div>

      {uniqueBids.length === 0 ? (
        <div className="text-center py-20 bg-white/85 rounded-3xl border border-[#f0d9c4] flex flex-col items-center gap-3 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <Gavel className="w-16 h-16 text-[#e7a77c]" />
          <h3 className="font-bold text-[#352B24] text-lg">Nuk keni asnje oferte aktive</h3>
          <p className="text-[#7c614f] text-sm">Gjeni produkte fantastike dhe filloni ofertimin tuaj.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-[#df6b2e] hover:bg-[#c85f28] text-white font-bold rounded-xl text-xs uppercase mt-2 transition-colors">
            Shfleto Ankande Aktive
          </Link>
        </div>
      ) : (
        <div className="bg-white/85 border border-[#f0d9c4] rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#6f5a4b]">
              <thead className="bg-[#fff7ed] border-b border-[#f0d9c4] text-[#7c614f] font-extrabold uppercase tracking-wider text-3xs">
                <tr>
                  <th scope="col" className="px-6 py-4">Produkti</th>
                  <th scope="col" className="px-6 py-4">Bidi Juaj Me i Larte</th>
                  <th scope="col" className="px-6 py-4">Oferte Aktive</th>
                  <th scope="col" className="px-6 py-4 text-center">Gjendja</th>
                  <th scope="col" className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0d9c4]">
                {uniqueBids.map((bid) => {
                  const isAuctionActive = bid.auction?.status === "active";
                  const isHighest = bid.amount === bid.auction?.current_price;
                  
                  let badgeLabel = "";
                  let badgeStyle = "";

                  if (!isAuctionActive) {
                    badgeLabel = "Mbyllur";
                    badgeStyle = "bg-[#f6eadf] text-[#7c614f]";
                  } else if (isHighest) {
                    badgeLabel = "Ne Udheheqje";
                    badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                  } else {
                    badgeLabel = "Tej-kaluar";
                    badgeStyle = "bg-amber-50 text-amber-700 border border-amber-200";
                  }

                  return (
                    <tr key={bid.id} className="hover:bg-[#fff7ed] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#352B24]">
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          <span className="truncate">{bid.auction?.product?.title}</span>
                          <span className="text-3xs text-[#9b7b66] lowercase">
                            ID: {bid.auction_id.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#352B24]">
                        {bid.amount.toLocaleString()} Llek
                      </td>
                      <td className="px-6 py-4 font-extrabold text-emerald-700">
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#fff7ed] border border-[#efcfb5] text-[#df6b2e] transition-colors"
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

