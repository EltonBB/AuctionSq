import Link from "next/link";
import { Heart } from "lucide-react";
import CountdownText from "@/app/components/CountdownText";
import SafeImage from "@/app/components/SafeImage";
import { formatEurFromAll } from "@/lib/currency";
import type { Auction, Category, Product } from "@/lib/db";

export type AuctionWithProduct = Auction & {
  product?: Product | null;
  category?: Category | null;
};

export function BrandLogo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="NjeKlik">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={compact ? "/brand/njeklik-mark-transparent.png" : "/brand/njeklik-wordmark-transparent.png"}
        alt="NjeKlik"
        className={compact ? "h-10 w-10 rounded-xl object-contain" : "h-12 w-auto object-contain"}
      />
    </Link>
  );
}

export function BrandAuctionCard({ auction, compact = false }: { auction: AuctionWithProduct; compact?: boolean }) {
  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={`group block overflow-hidden rounded-[18px] border border-[#f0d9c4] bg-white shadow-[0_16px_40px_rgba(53,43,36,0.06)] transition hover:-translate-y-1 hover:border-[#D96C2D]/50 hover:shadow-[0_18px_48px_rgba(217,108,45,0.14)] sm:rounded-[22px] ${compact ? "min-w-[210px]" : ""}`}
    >
      <div className={`relative bg-[#F7D8B5]/30 ${compact ? "h-48" : "aspect-[1.18]"}`}>
        <SafeImage
          src={auction.product?.images?.[0] || "/brand/home-feature-product.png"}
          alt={auction.product?.title || "Produkt ne ankand"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-[#D96C2D] px-2.5 py-1 text-[10px] font-black uppercase text-white">
          Live
        </span>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#f0d9c4] bg-white/95 text-[#6f5b4c] backdrop-blur sm:h-10 sm:w-10">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <p className="mb-2 line-clamp-1 text-[10px] font-black uppercase tracking-wide text-[#D96C2D] sm:text-[11px]">
          {auction.category?.name || "Kategori"}
        </p>
        <h3 className="line-clamp-2 min-h-[42px] text-sm font-black leading-5 text-[#352B24]">
          {auction.product?.title}
        </h3>
        <div className="mt-4 grid gap-2 sm:flex sm:items-end sm:justify-between sm:gap-3">
          <div>
            <div className="text-base font-black text-[#D96C2D] sm:text-xl">{formatEurFromAll(auction.current_price)}</div>
            <div className="text-[11px] font-semibold text-[#8a7565]">Oferta aktuale</div>
          </div>
          <div className="sm:text-right">
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


