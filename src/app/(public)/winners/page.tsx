import Link from "next/link";
import { Award, Calendar, ChevronRight, Crown, Gavel, Sparkles } from "lucide-react";
import PollingRefresh from "@/app/components/PollingRefresh";
import { getAuctions } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";

export const revalidate = 0;

function maskName(name: string) {
  if (!name) return "Perdorues";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0].slice(0, 2)}*** ${parts[1].slice(0, 1)}.`;
  return `${name.slice(0, 3)}***`;
}

export default async function WinnersPage() {
  const auctions = await getAuctions();
  const endedAuctions = auctions
    .filter((auction) => auction.status === "ended" && auction.winner_id)
    .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());

  const thisMonthWinners = endedAuctions.filter((auction) => {
    const date = new Date(auction.end_time);
    const now = new Date();
    return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
  }).length;

  return (
    <div className="min-h-screen bg-slate-100">
      <PollingRefresh intervalMs={15000} />
      <section className="bg-[#071f43]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 text-white">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                <Award className="h-3.5 w-3.5" />
                Porosite e Mia
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                Historia e fitoreve dhe porosive te mbyllura.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90">
                Ndiqni ankandet qe jane mbyllur me sukses, fituesit e shpallur dhe cmimet fituese.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Totali fitoreve</p>
                <p className="mt-2 text-3xl font-black">{endedAuctions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Ky muaj</p>
                <p className="mt-2 text-3xl font-black">{thisMonthWinners}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10">
        {endedAuctions.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <Crown className="mx-auto h-14 w-14 text-slate-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">Ende pa porosi te mbyllura</h2>
            <p className="mt-2 text-sm text-slate-500">Ka produkte aktive ne ankand. Vendos oferten tende per t&apos;u bere fitues.</p>
            <Link
              href="/auctions"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#082047] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#12366d]"
            >
              Shko te ankandet
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {endedAuctions.map((auction) => (
              <div key={auction.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[1.3] bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auction.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                    alt={auction.product?.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">
                    Fitues
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    {auction.category?.name || "Kategori"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 min-h-[44px] text-base font-black text-slate-950">
                    {auction.product?.title}
                  </h3>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fituesi</span>
                      <span className="font-bold text-emerald-700">{maskName(auction.winner_id || "")}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-slate-500">Cmimi fitues</span>
                  <span className="font-black text-blue-700">{formatEurFromAll(auction.current_price)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(auction.end_time).toLocaleDateString("sq-AL")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                      <Sparkles className="h-3.5 w-3.5 text-blue-700" />
                      Ankand i mbyllur
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
            <Gavel className="h-4 w-4 text-blue-700" />
            Doni te testoni ofertimin?
          </p>
          <p className="mt-1 text-sm text-slate-500">Kemi shtuar produkte me afat aktiv qe mund te testohen direkt nga faqja e ankandeve.</p>
          <Link href="/auctions" className="mt-3 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:text-blue-800">
            Hap ankandet aktive
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
