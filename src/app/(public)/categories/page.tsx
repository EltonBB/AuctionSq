import Link from "next/link";
import { ChevronRight, FolderHeart, Gavel, Layers3, Sparkles } from "lucide-react";
import { getAuctions, getCategories } from "@/lib/db";

export const revalidate = 0;

export default async function CategoriesPage() {
  const [categories, auctions] = await Promise.all([getCategories(), getAuctions()]);
  const activeAuctions = auctions.filter((auction) => auction.status === "active");

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <section className="rounded-[28px] border border-[#f0d9c4] bg-[#fff3e6] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">
              <Layers3 className="h-3.5 w-3.5" />
              Kategorite
            </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-[#352B24] sm:text-6xl">
              Zgjidh kategorine dhe futu direkt ne ankande reale.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5b4c]">
              Cdo kategori permban produkte te kontrolluara nga stafi i NjeKlik, me foto, detaje teknike dhe histori ofertash.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#f0d9c4] bg-white/75 p-4">
              <p className="text-xs font-bold uppercase text-[#8a7565]">Kategori</p>
              <p className="mt-2 text-3xl font-black text-[#D96C2D]">{categories.length}</p>
            </div>
            <div className="rounded-2xl border border-[#f0d9c4] bg-white/75 p-4">
              <p className="text-xs font-bold uppercase text-[#8a7565]">Ankande aktive</p>
              <p className="mt-2 text-3xl font-black text-[#D96C2D]">{activeAuctions.length}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-[#f0d9c4] bg-white/75 p-4 sm:col-span-1">
              <p className="text-xs font-bold uppercase text-[#8a7565]">Cilesi</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-black text-[#352B24]">
                <Sparkles className="h-4 w-4 text-[#D96C2D]" />
                Te verifikuara
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const activeCount = activeAuctions.filter((auction) => auction.product?.category_id === category.id).length;
          return (
            <Link
              key={category.id}
              href={`/auctions?category=${category.slug}`}
              className="group flex min-h-[220px] flex-col rounded-[24px] border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)] transition hover:-translate-y-1 hover:border-[#D96C2D]/45"
            >
              <div className="w-fit rounded-xl bg-[#F7D8B5] p-3 text-[#D96C2D]">
                <FolderHeart className="h-5 w-5" />
              </div>
                  <h2 className="mt-4 text-2xl font-black text-[#352B24] group-hover:text-[#D96C2D]">
                {category.name}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6f5b4c]">{category.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-[#f0d9c4] pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8a7565]">
                  <Gavel className="h-3.5 w-3.5 text-[#D96C2D]" />
                  {activeCount} ankande aktive
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#D96C2D]">
                  Hape
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

