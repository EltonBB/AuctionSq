import React from "react";
import Link from "next/link";
import { getAuctions, getCategories } from "@/lib/db";
import { ChevronDown, Heart, Search, SlidersHorizontal } from "lucide-react";

export const revalidate = 0;

interface AuctionsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

function formatTime(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export default async function AuctionsPage({ searchParams }: AuctionsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategorySlug = resolvedParams.category;
  const searchQuery = resolvedParams.search || "";

  const allAuctions = await getAuctions();
  const categories = await getCategories();

  let filteredAuctions = allAuctions.filter((auction) => auction.status === "active");

  if (activeCategorySlug) {
    const matchedCategory = categories.find((category) => category.slug === activeCategorySlug);
    if (matchedCategory) {
      filteredAuctions = filteredAuctions.filter((auction) => auction.product?.category_id === matchedCategory.id);
    }
  }

  if (searchQuery) {
    filteredAuctions = filteredAuctions.filter((auction) =>
      auction.product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.product?.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] px-4 py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950 md:text-5xl">
                Te gjitha produktet
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Shfleto ankandet aktive, filtro sipas kategorise dhe vendos oferten tende ne produktet e kontrolluara.
              </p>
            </div>
            <div className="rounded-2xl bg-[#082047] px-5 py-4 text-white">
              <div className="text-3xl font-black">{filteredAuctions.length}</div>
              <div className="text-xs font-semibold uppercase text-blue-100">ankande aktive</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="flex gap-3 overflow-x-auto">
              <Link
                href="/auctions"
                className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition ${
                  !activeCategorySlug
                    ? "border-[#082047] bg-[#082047] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                Te gjitha
                <ChevronDown className="h-4 w-4" />
              </Link>
              {categories.map((category) => {
                const isActive = activeCategorySlug === category.slug;
                return (
                  <Link
                    key={category.id}
                    href={`/auctions?category=${category.slug}`}
                    className={`shrink-0 rounded-full border px-5 py-3 text-sm font-bold transition ${
                      isActive
                        ? "border-[#082047] bg-[#082047] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>

            <form method="GET" action="/auctions" className="relative">
              {activeCategorySlug && <input type="hidden" name="category" value={activeCategorySlug} />}
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Kerko produkte..."
                className="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
              />
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10">
        <div className="mb-7 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4" />
            U gjeten {filteredAuctions.length} produkte
          </div>
          <span>Renditje: me te rejat</span>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-16 text-center">
            <h3 className="text-xl font-black text-slate-900">Nuk u gjet asnje ankand</h3>
            <p className="mt-2 text-sm text-slate-500">Provo nje kategori tjeter ose pastro filtrat.</p>
            <Link href="/auctions" className="mt-6 inline-flex rounded-full bg-[#082047] px-6 py-3 text-sm font-bold text-white">
              Pastro filtrat
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAuctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[1.2] bg-slate-50">
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
                  <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                    {auction.category?.name || "Kategori"}
                  </p>
                  <h3 className="line-clamp-2 min-h-[42px] text-sm font-bold leading-5 text-slate-950">
                    {auction.product?.title}
                  </h3>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xl font-black text-blue-700">
                        {auction.current_price.toLocaleString()} L
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
