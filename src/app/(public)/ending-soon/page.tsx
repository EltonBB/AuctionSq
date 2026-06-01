import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import CountdownTimer from "@/app/components/CountdownTimer";
import PollingRefresh from "@/app/components/PollingRefresh";
import { Clock, Gavel } from "lucide-react";

export const revalidate = 0;

export default async function EndingSoonPage() {
  const auctions = await getAuctions();
  
  // Sort active auctions by end_time ascending
  const endingSoon = auctions
    .filter((a) => a.status === "active")
    .sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());

  // Condition translate map
  const conditionLabels: Record<string, string> = {
    new: "E Re",
    like_new: "Si e Re",
    used_good: "E Përdorur (Mirë)",
    used_fair: "E Përdorur (Kënaqshëm)"
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-10">
      <PollingRefresh intervalMs={10000} />
      <div className="flex flex-col gap-4 text-left">
        <span className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Sekondat e Fundit</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Ankandet Drejt Përfundimit</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Nuk ka kohë për të pritur! Këto ankande janë drejt mbylljes. Vendosni ofertat tuaja përpara se kronometri të shënojë zero!
        </p>
      </div>

      {endingSoon.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
          <Gavel className="w-16 h-16 text-slate-700" />
          <h3 className="font-bold text-slate-400 text-lg">Nuk ka ankande në mbyllje</h3>
          <p className="text-slate-500 text-sm">Të gjitha produktet aktive kanë ende kohë të mjaftueshme.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {endingSoon.map((auc) => (
            <div
              key={auc.id}
              className="bg-slate-900/30 border border-slate-900 hover:border-red-500/10 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-1 shadow-sm group"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                  alt={auc.product?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded bg-red-500 text-slate-950 font-black text-2xs uppercase tracking-wider shadow">
                    Urgent
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <CountdownTimer endTime={auc.end_time} />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <span className="text-blue-500 text-xs font-semibold uppercase">{auc.category?.name || "Kategori"}</span>
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors truncate">
                  {auc.product?.title}
                </h3>
                <span className="text-slate-500 text-2xs uppercase font-medium">Gjendja: {conditionLabels[auc.product?.condition] || auc.product?.condition}</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-auto">
                <div>
                  <span className="text-slate-500 text-2xs block uppercase">Ofertë Aktive</span>
                  <p className="text-lg font-black text-emerald-400">{auc.current_price.toLocaleString()} Llek</p>
                </div>
                <Link
                  href={`/auctions/${auc.id}`}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow"
                >
                  Vendos Oferte
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
