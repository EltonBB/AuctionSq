import React from "react";
import Link from "next/link";
import { getAuctions, getCategories } from "@/lib/db";
import CountdownTimer from "@/app/components/CountdownTimer";
import { Gavel, Search, ListFilter } from "lucide-react";

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

  const allAuctions = await getAuctions();
  const categories = await getCategories();

  // Condition translate map
  const conditionLabels: Record<string, string> = {
    new: "E Re",
    like_new: "Si e Re",
    used_good: "E Përdorur (Mirë)",
    used_fair: "E Përdorur (Kënaqshëm)"
  };

  // Condition styling map
  const conditionStyles: Record<string, string> = {
    new: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    like_new: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    used_good: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    used_fair: "bg-slate-500/10 border-slate-500/20 text-slate-400"
  };

  // Filter actions
  let filteredAuctions = allAuctions.filter((a) => a.status === "active");

  if (activeCategorySlug) {
    const matchedCategory = categories.find((c) => c.slug === activeCategorySlug);
    if (matchedCategory) {
      filteredAuctions = filteredAuctions.filter(
        (a) => a.product?.category_id === matchedCategory.id
      );
    }
  }

  if (searchQuery) {
    filteredAuctions = filteredAuctions.filter((a) =>
      a.product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.product?.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-10">
      {/* Search Header */}
      <div className="flex flex-col gap-4 text-left">
        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Shfletoni</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Të Gjitha Ankandet Aktive</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Zgjidhni kategori të ndryshme dhe ofertoni për produktet tuaja të preferuara të verifikuara nga ekipi ynë.
        </p>
      </div>

      {/* Categories & Search filter row */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border-b border-slate-900 pb-6">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            href="/auctions"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              !activeCategorySlug
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            Të gjitha
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/auctions?category=${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Local Search Input Form */}
        <form method="GET" action="/auctions" className="w-full lg:w-fit relative max-w-sm">
          {activeCategorySlug && <input type="hidden" name="category" value={activeCategorySlug} />}
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Kërkoni produkte..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-200 text-sm focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-600"
          />
        </form>
      </div>

      {/* Grid count state */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <ListFilter className="w-4 h-4 text-slate-400" />
          <span>U gjetën {filteredAuctions.length} ankande aktive</span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <Gavel className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk u gjet asnjë ankand</h3>
          <p className="text-slate-500 text-sm">Provoni të kërkoni me filtra të tjerë ose shfletoni kategoritë.</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors mt-2">
            Pastro Filtrat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAuctions.map((auc) => (
            <div
              key={auc.id}
              className="bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-1 shadow-sm group"
            >
              {/* Product Thumbnail */}
              <div className="aspect-[4/3] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                  alt={auc.product?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded border text-2xs uppercase tracking-wider font-semibold backdrop-blur-sm ${conditionStyles[auc.product?.condition] || "bg-slate-950/80 text-slate-300 border-slate-800"}`}>
                    {conditionLabels[auc.product?.condition] || auc.product?.condition}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <CountdownTimer endTime={auc.end_time} />
                </div>
              </div>

              {/* Title / Description info */}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-blue-500 text-xs font-semibold uppercase">{auc.category?.name || "Kategori"}</span>
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                  {auc.product?.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mt-1">
                  {auc.product?.description}
                </p>
              </div>

              {/* Price Actions block */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-auto">
                <div>
                  <span className="text-slate-500 text-2xs block uppercase">Çmimi Fillestar</span>
                  <span className="text-slate-400 font-semibold text-xs line-through">{auc.starting_price.toLocaleString()} Llek</span>
                  <span className="text-slate-500 text-2xs block uppercase mt-1">Ofertë Aktive</span>
                  <p className="text-lg font-black text-emerald-400">{auc.current_price.toLocaleString()} Llek</p>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <Link
                    href={`/auctions/${auc.id}`}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow shadow-blue-500/10"
                  >
                    Oferto Tani
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
