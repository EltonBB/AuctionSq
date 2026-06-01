import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import PollingRefresh from "@/app/components/PollingRefresh";
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";

export const revalidate = 0;

function formatTime(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

function ProductCard({
  auction,
  compact = false,
}: {
  auction: Awaited<ReturnType<typeof getAuctions>>[number];
  compact?: boolean;
}) {
  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${compact ? "min-w-[198px]" : ""}`}
    >
      <div className={`relative bg-slate-50 ${compact ? "h-48" : "aspect-[1.2]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={auction.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
          alt={auction.product?.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-black uppercase text-white">
          Hot
        </span>
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 backdrop-blur">
          <Heart className="h-5 w-5" />
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-950">
          {auction.product?.title}
        </h3>
        <p className="mt-3 text-xs font-bold uppercase text-slate-400">
          {auction.winning_bid_id ? "Fitues" : "Oferta aktive"}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-black text-blue-700">
              {formatEurFromAll(auction.current_price)}
            </div>
            <div className="text-[11px] font-medium text-slate-400">Oferta aktuale</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-[#082047]">{formatTime(auction.end_time)}</div>
            <div className="text-[11px] font-medium text-slate-400">Koha e mbetur</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const allAuctions = await getAuctions();
  const activeAuctions = allAuctions.filter((auction) => auction.status === "active");
  const hotAuctions = activeAuctions.slice(0, 4);

  return (
    <div className="bg-white">
      <PollingRefresh intervalMs={15000} />
      <section className="bg-[#082047] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 lg:grid-cols-[330px_1fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-8 flex gap-3">
              {["20", "47", "23"].map((part) => (
                <span key={part} className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-black">
                  {part}
                </span>
              ))}
            </div>
            <h1 className="max-w-[320px] text-4xl font-black leading-[1.15] tracking-[-0.03em] md:text-5xl">
              Kap ofertat me te mira. Produkte unike ne ankand.
            </h1>
            <p className="mt-6 max-w-[290px] text-sm leading-6 text-blue-100">
              Shfleto, vendos oferten tende dhe fito produktin.
            </p>
          </div>

          <div className="min-w-0">
            <div className="mb-6 flex justify-end gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {hotAuctions.map((auction) => (
                <ProductCard key={auction.id} auction={auction} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-slate-950 md:text-3xl">Te gjitha produktet</h2>
          <Link href="/auctions" className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700">
            {activeAuctions.length} produkte
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {activeAuctions.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-16 text-center">
            <h3 className="text-xl font-black text-slate-900">Nuk ka ankande aktive per momentin</h3>
            <p className="mt-2 text-sm text-slate-500">Kontrollo perseri se shpejti per produkte te reja.</p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeAuctions.map((auction) => (
              <ProductCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
