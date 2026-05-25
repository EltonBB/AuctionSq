import React from "react";
import Link from "next/link";
import { getCategories, getAuctions } from "@/lib/db";
import { FolderHeart, ChevronRight, Gavel } from "lucide-react";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();
  const auctions = await getAuctions();
  const activeAuctions = auctions.filter((a) => a.status === "active");

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-4 text-left">
        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Kategoritë</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Shfleto Sipas Kategorisë</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Zgjidhni njërën nga kategoritë e mëposhtme për të filtruar ankandet aktive që përputhen me interesat tuaja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const count = activeAuctions.filter((a) => a.product?.category_id === cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/auctions?category=${cat.slug}`}
              className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl flex flex-col gap-4 transition-all hover:-translate-y-1 shadow-sm text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <FolderHeart className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-white text-lg group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-auto">
                <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-slate-500" />
                  <span>{count} ankande aktive</span>
                </span>
                <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
                  <span>Shiko</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
