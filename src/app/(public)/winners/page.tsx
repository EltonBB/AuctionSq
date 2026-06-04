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
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <PollingRefresh intervalMs={15000} />
      <section className="rounded-[28px] border border-[#f0d9c4] bg-[#fff3e6] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">
              <Award className="h-3.5 w-3.5" />
              Fituesit
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#352B24] sm:text-6xl">
              Historia e fitoreve dhe porosive te mbyllura.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5b4c]">
              Ndiq ankandet e mbyllura me sukses, fituesit e shpallur dhe cmimet fituese.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#f0d9c4] bg-white/75 p-4">
              <p className="text-xs font-bold uppercase text-[#8a7565]">Totali fitoreve</p>
              <p className="mt-2 text-3xl font-black text-[#D96C2D]">{endedAuctions.length}</p>
            </div>
            <div className="rounded-2xl border border-[#f0d9c4] bg-white/75 p-4">
              <p className="text-xs font-bold uppercase text-[#8a7565]">Ky muaj</p>
              <p className="mt-2 text-3xl font-black text-[#D96C2D]">{thisMonthWinners}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {endedAuctions.length === 0 ? (
          <div className="rounded-[28px] border border-[#f0d9c4] bg-white/84 p-14 text-center shadow-sm">
            <Crown className="mx-auto h-14 w-14 text-[#E6A52F]" />
            <h2 className="mt-4 text-2xl font-black text-[#352B24]">Ende pa porosi te mbyllura</h2>
            <p className="mt-2 text-sm text-[#6f5b4c]">Ka produkte aktive ne ankand. Vendos oferten tende per t&apos;u bere fitues.</p>
            <Link href="/auctions" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D96C2D] px-6 py-3 text-sm font-black uppercase tracking-wide text-white">
              Shko te ankandet
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {endedAuctions.map((auction) => (
              <div key={auction.id} className="overflow-hidden rounded-[24px] border border-[#f0d9c4] bg-white/86 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
                <div className="relative aspect-[1.3] bg-[#F7D8B5]/25">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auction.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                    alt={auction.product?.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#E6A52F] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#352B24]">
                    Fitues
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#D96C2D]">
                    {auction.category?.name || "Kategori"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 min-h-[44px] text-base font-black text-[#352B24]">
                    {auction.product?.title}
                  </h3>
                  <div className="mt-4 rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6f5b4c]">Fituesi</span>
                      <span className="font-bold text-[#D96C2D]">{maskName(auction.winner_id || "")}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[#6f5b4c]">emimi fitues</span>
                      <span className="font-black text-[#D96C2D]">{formatEurFromAll(auction.current_price)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#f0d9c4] pt-3 text-xs text-[#6f5b4c]">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(auction.end_time).toLocaleDateString("sq-AL")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-[#D96C2D]" />
                      Ankand i mbyllur
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-[24px] border border-[#f0d9c4] bg-white/84 p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm font-black text-[#352B24]">
            <Gavel className="h-4 w-4 text-[#D96C2D]" />
            Doni te testoni ofertimin?
          </p>
          <p className="mt-1 text-sm text-[#6f5b4c]">Kemi produkte me afat aktiv qe mund te testohen direkt nga faqja e ankandeve.</p>
          <Link href="/auctions" className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#D96C2D]">
            Hap ankandet aktive
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

