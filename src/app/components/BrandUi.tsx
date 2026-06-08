import Link from "next/link";
import { Heart } from "lucide-react";
import CountdownText from "@/app/components/CountdownText";
import { formatEurFromAll } from "@/lib/currency";
import type { Auction, Category, Product } from "@/lib/db";

export type AuctionWithProduct = Auction & {
  product?: Product | null;
  category?: Category | null;
};

export function BrandLogo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="AuctionSq">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={compact ? "/brand/auctionsq-mark-transparent.png" : "/brand/auctionsq-wordmark-transparent.png"}
        alt="AuctionSq"
        className={compact ? "h-10 w-10 rounded-xl object-contain" : "h-12 w-auto object-contain"}
      />
    </Link>
  );
}

export function BrandAuctionCard({ auction, compact = false }: { auction: AuctionWithProduct; compact?: boolean }) {
  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={`group block overflow-hidden rounded-[22px] border border-[#f0d9c4] bg-white shadow-[0_16px_40px_rgba(53,43,36,0.06)] transition hover:-translate-y-1 hover:border-[#D96C2D]/50 hover:shadow-[0_18px_48px_rgba(217,108,45,0.14)] ${compact ? "min-w-[210px]" : ""}`}
    >
      <div className={`relative bg-[#F7D8B5]/30 ${compact ? "h-48" : "aspect-[1.18]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={auction.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
          alt={auction.product?.title || "Produkt ne ankand"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-[#D96C2D] px-2.5 py-1 text-[10px] font-black uppercase text-white">
          Live
        </span>
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#f0d9c4] bg-white/95 text-[#6f5b4c] backdrop-blur">
          <Heart className="h-5 w-5" />
        </span>
      </div>
      <div className="p-4">
        <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-[#D96C2D]">
          {auction.category?.name || "Kategori"}
        </p>
        <h3 className="line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-[#352B24]">
          {auction.product?.title}
        </h3>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-black text-[#D96C2D]">{formatEurFromAll(auction.current_price)}</div>
            <div className="text-[11px] font-semibold text-[#8a7565]">Oferta aktuale</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-[#352B24]">
              <CountdownText endTime={auction.end_time} />
            </div>
            <div className="text-[11px] font-semibold text-[#8a7565]">Koha e mbetur</div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-[#D96C2D]/45 px-4 py-2 text-center text-xs font-black text-[#D96C2D] transition group-hover:bg-[#D96C2D] group-hover:text-white">
          Bej oferte
        </div>
      </div>
    </Link>
  );
}

export function BrandPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[24px] border border-[#f0d9c4] bg-white/86 shadow-[0_16px_44px_rgba(53,43,36,0.06)] ${className}`}>
      {children}
    </section>
  );
}


