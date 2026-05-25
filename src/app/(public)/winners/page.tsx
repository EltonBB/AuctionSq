import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import { Award, Gavel, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function WinnersPage() {
  const auctions = await getAuctions();
  
  // Filter ended auctions with a winner
  const endedAuctions = auctions
    .filter((a) => a.status === "ended" && a.winner_id)
    .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());

  // Mask function
  const maskName = (name: string) => {
    if (!name) return "Përdorues";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[1];
      return `${first.substring(0, 2)}*** ${last.substring(0, 1)}.`;
    }
    return `${name.substring(0, 3)}***`;
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-4 text-left">
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Arritjet</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Fituesit e Fundit të Ankandeve</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Këtu do të gjeni historikun e ankandeve të mbyllura me sukses dhe fituesit që kanë marrë produktet e tyre të preferuara me çmime unike.
        </p>
      </div>

      {endedAuctions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <Award className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk ka ende ankande të përfunduara</h3>
          <p className="text-slate-500 text-sm">Garoni në ankandet tona aktive për t&apos;u bërë fituesi i parë!</p>
          <Link href="/auctions" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors mt-2">
            Shko te Ankandet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {endedAuctions.map((auc) => (
            <div
              key={auc.id}
              className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-slate-800 shadow"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={auc.product?.images?.[0]}
                  alt={auc.product?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-black text-2xs uppercase tracking-wider shadow">
                    Fitues
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <span className="text-blue-500 text-xs font-semibold uppercase">{auc.category?.name || "Kategori"}</span>
                <h3 className="font-bold text-white text-base leading-tight truncate">
                  {auc.product?.title}
                </h3>

                <div className="flex flex-col gap-1.5 bg-slate-950/60 border border-slate-900 p-3 rounded-xl text-xs text-slate-400 mt-1">
                  <div className="flex justify-between items-center">
                    <span>Fituesi i Shpallur:</span>
                    <span className="font-bold text-emerald-400">
                      {maskName(auc.winner_id || "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Çmimi Fitues:</span>
                    <span className="font-black text-white">{auc.current_price.toLocaleString()} Llek</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-3xs border-t border-slate-900 pt-1.5 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(auc.end_time).toLocaleDateString("sq-AL")}</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Mbyllur</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
