import Link from "next/link";
import { ChevronRight, FolderHeart, Gavel, Layers3, Sparkles } from "lucide-react";
import { getAuctions, getCategories } from "@/lib/db";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();
  const auctions = await getAuctions();
  const activeAuctions = auctions.filter((auction) => auction.status === "active");
  const totalActive = activeAuctions.length;

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="bg-[#061b3a]">
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="text-left text-white">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                <Layers3 className="h-3.5 w-3.5" />
                Categories
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-[-0.03em] sm:text-5xl">
                Zgjidhni kategorine dhe hyni direkt ne ankande reale.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90">
                Kategorite me poshte organizojne vetem produkte te kontrolluara nga stafi i AuctionSq. Cdo kategori ju con drejt listimeve aktive me foto, detaje teknike dhe historie ofertash.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Kategori</p>
                <p className="mt-2 text-3xl font-black">{categories.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Ankande aktive</p>
                <p className="mt-2 text-3xl font-black">{totalActive}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-white sm:col-span-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Cilesi</p>
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-black">
                  <Sparkles className="h-4 w-4 text-blue-200" />
                  Verified Listings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const activeCount = activeAuctions.filter((auction) => auction.product?.category_id === category.id).length;
            const accent = ["from-[#0c2d60] to-[#18448c]", "from-[#0f2f66] to-[#2458a8]", "from-[#153b72] to-[#2c69bf]"][index % 3];

            return (
              <Link
                key={category.id}
                href={`/auctions?category=${category.slug}`}
                className="group flex min-h-[240px] flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-fit rounded-xl bg-gradient-to-r ${accent} p-3 text-white`}>
                  <FolderHeart className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.02em] text-slate-950 group-hover:text-[#18448c]">
                  {category.name}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Gavel className="h-3.5 w-3.5 text-blue-700" />
                    {activeCount} ankande aktive
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-black text-blue-700">
                    Hape
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
