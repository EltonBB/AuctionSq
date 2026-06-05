"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandAuctionCard, type AuctionWithProduct } from "@/app/components/BrandUi";

export default function AuctionShowMoreGrid({ auctions }: { auctions: AuctionWithProduct[] }) {
  const [visibleCount, setVisibleCount] = useState(8);
  const visibleAuctions = auctions.slice(0, visibleCount);
  const canShowMore = visibleCount < auctions.length;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {visibleAuctions.map((auction, index) => (
          <div key={auction.id} className="reveal-up" style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}>
            <BrandAuctionCard auction={auction} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {canShowMore ? (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 7, auctions.length))}
            className="rounded-full border border-[#D96C2D]/35 bg-white px-7 py-3 text-sm font-black text-[#D96C2D] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#D96C2D] hover:text-white"
          >
            Shfaq me shume
          </button>
        ) : (
          <Link
            href="/auctions"
            className="rounded-full border border-[#D96C2D]/35 bg-white px-7 py-3 text-sm font-black text-[#D96C2D] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#D96C2D] hover:text-white"
          >
            Shiko te gjitha ankandet
          </Link>
        )}
      </div>
    </div>
  );
}
