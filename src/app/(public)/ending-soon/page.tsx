import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import { Clock, Gavel } from "lucide-react";

export const revalidate = 0;

export default async function EndingSoonPage() {
  const auctions = await getAuctions();
  const endingSoon = auctions
    .filter((auction) => auction.status === "active")
    .sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <PollingRefresh intervalMs={10000} />
      <section className="rounded-[28px] border border-[#f0d9c4] bg-[#fff3e6] p-8 md:p-10">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D96C2D]">
          <Clock className="h-4 w-4 animate-pulse" />
          Sekondat e fundit
        </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-black text-[#352B24] sm:text-6xl">
          Ankandet drejt perfundimit
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5b4c]">
          Keto ankande mbyllen me shpejt. Vendos oferten perpara se kronometri te shenoje zero.
        </p>
      </section>

      {endingSoon.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-[28px] border border-[#f0d9c4] bg-white/84 py-20 text-center">
          <Gavel className="h-16 w-16 text-[#E6A52F]" />
          <h3 className="text-lg font-black text-[#352B24]">Nuk ka ankande ne mbyllje</h3>
          <p className="text-sm text-[#6f5b4c]">Te gjitha produktet aktive kane ende kohe te mjaftueshme.</p>
          <Link href="/auctions" className="mt-3 rounded-xl bg-[#D96C2D] px-5 py-3 text-sm font-black text-white">
            Shiko ankandet
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {endingSoon.map((auction) => (
            <BrandAuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}

