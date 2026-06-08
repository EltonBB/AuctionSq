import React from "react";
import Link from "next/link";
import { getAuctions, getCategories } from "@/lib/db";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

export const revalidate = 0;

interface AuctionsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function AuctionsPage({ searchParams }: AuctionsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategorySlug = resolvedParams.category;
  const searchQuery = resolvedParams.search || "";

  const [allAuctions, categories] = await Promise.all([getAuctions(), getCategories()]);
  let filteredAuctions = allAuctions.filter((auction) => auction.status === "active");

  if (activeCategorySlug) {
    const matchedCategory = categories.find((category) => category.slug === activeCategorySlug);
    if (matchedCategory) {
      filteredAuctions = filteredAuctions.filter((auction) => auction.product?.category_id === matchedCategory.id);
    }
  }

  if (searchQuery) {
    const normalized = searchQuery.toLowerCase();
    filteredAuctions = filteredAuctions.filter((auction) =>
      auction.product?.title.toLowerCase().includes(normalized) ||
      auction.product?.description.toLowerCase().includes(normalized)
    );
  }

  return (
    <div>
      <PollingRefresh intervalMs={15000} />
      <section className="border-b border-[#f0d9c4] bg-[#fffdf8]/70">
        <div className="mx-auto max-w-[1500px] px-4 py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#352B24] md:text-6xl">
                Te gjitha produktet
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f5b4c]">
                Shfleto ankandet aktive, filtro sipas kategorise dhe vendos oferten tende ne produkte te kontrolluara.
              </p>
            </div>
            <div className="w-fit rounded-[22px] bg-[#352B24] px-6 py-5 text-white">
              <div className="text-3xl font-black">{filteredAuctions.length}</div>
              <div className="text-xs font-bold uppercase text-[#F7D8B5]">ankande aktive</div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 border-t border-[#f0d9c4] pt-5">
            <div className="min-w-0 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-3">
                <Link
                  href="/auctions"
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-black transition ${
                    !activeCategorySlug
                      ? "border-[#D96C2D] bg-[#D96C2D] text-white"
                      : "border-[#f0d9c4] bg-white text-[#5e4c3f] hover:border-[#D96C2D]/45 hover:text-[#D96C2D]"
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
                      className={`shrink-0 rounded-full border px-5 py-3 text-sm font-black transition ${
                        isActive
                          ? "border-[#D96C2D] bg-[#D96C2D] text-white"
                          : "border-[#f0d9c4] bg-white text-[#5e4c3f] hover:border-[#D96C2D]/45 hover:text-[#D96C2D]"
                      }`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form method="GET" action="/auctions" className="relative w-full max-w-xl">
              {activeCategorySlug && <input type="hidden" name="category" value={activeCategorySlug} />}
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7565]" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Kerko produkte..."
                className="brand-focus h-12 w-full rounded-full border border-[#ead2bc] bg-white pl-12 pr-4 text-sm font-semibold text-[#352B24] placeholder:text-[#a99584]"
              />
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-12 pt-10">
        <div className="mb-7 flex items-center justify-between text-sm text-[#6f5b4c]">
          <div className="flex items-center gap-2 font-bold">
            <SlidersHorizontal className="h-4 w-4 text-[#D96C2D]" />
            U gjeten {filteredAuctions.length} produkte
          </div>
          <span>Renditje: me te rejat</span>
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="rounded-[28px] border border-[#f0d9c4] bg-white/80 p-16 text-center">
            <h3 className="text-xl font-black text-[#352B24]">Nuk u gjet asnje ankand</h3>
            <p className="mt-2 text-sm text-[#6f5b4c]">Provo nje kategori tjeter ose pastro filtrat.</p>
            <Link href="/auctions" className="mt-6 inline-flex rounded-full bg-[#D96C2D] px-6 py-3 text-sm font-black text-white">
              Pastro filtrat
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAuctions.map((auction) => (
              <BrandAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

