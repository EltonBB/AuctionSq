import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import { ArrowRight, Gavel, Search, ShoppingBag, Trophy, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const revalidate = 0;

const processItems: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: Search, title: "Gjej produktin", copy: "Shfleto ankandet aktive dhe zgjidh produktin qe te intereson." },
  { icon: Gavel, title: "Bej oferten", copy: "Vendos oferten tende dhe ndiq garen ne kohe reale." },
  { icon: Trophy, title: "Fito ankandin", copy: "Oferta me e larte ne fund fiton produktin." },
  { icon: ShoppingBag, title: "Merr produktin", copy: "Ekipi konfirmon porosine dhe dorezimin." },
];

export default async function HomePage() {
  const allAuctions = await getAuctions();
  const activeAuctions = allAuctions
    .filter((auction) => auction.status === "active" && auction.product?.status === "active")
    .slice(0, 20);
  const featuredAuctions = activeAuctions.slice(0, 8);

  return (
    <div className="pb-10">
      <PollingRefresh intervalMs={15000} />

      <section className="mx-auto max-w-[1320px] px-4 pt-5">
        <div className="reveal-up rounded-[22px] border border-[#f0d9c4] bg-[#fff2e5] px-6 py-9 shadow-[0_24px_70px_rgba(217,108,45,0.10)] sm:px-10 lg:px-14">
          <div className="max-w-3xl">
            <h1 className="max-w-[620px] text-4xl font-black leading-tight text-[#352B24] sm:text-6xl">
              Oferto. Fito. Merre me <span className="text-[#D96C2D]">nje klik.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-7 text-[#5f5148]">
              Ankande live cdo dite per produkte te kontrolluara, me cmime qe ia vlejne dhe proces te thjeshte.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/auctions" className="rounded-xl bg-[#D96C2D] px-6 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(217,108,45,0.24)] transition hover:-translate-y-0.5 hover:bg-[#bf5520]">
                Shiko ankandet
              </Link>
              <a href="#si-funksionon" className="rounded-xl border border-[#D96C2D]/35 bg-white/60 px-6 py-3 text-sm font-black text-[#D96C2D] transition hover:-translate-y-0.5 hover:bg-white">
                Si funksionon
              </a>
            </div>
          </div>
        </div>
      </section>

      {featuredAuctions.length > 0 ? (
        <section className="mx-auto max-w-[1320px] px-4 pt-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">Ne ankand</p>
              <h2 className="mt-2 text-2xl font-black text-[#352B24]">Produkte te zgjedhura</h2>
            </div>
            <Link href="/auctions" className="hidden text-sm font-black text-[#D96C2D] sm:inline-flex">
              Te gjitha
            </Link>
          </div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3">
            {featuredAuctions.map((auction) => (
              <BrandAuctionCard key={auction.id} auction={auction} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1320px] px-4 pt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">Live tani</p>
            <h2 className="mt-2 text-3xl font-black text-[#352B24]">Ankandet aktive</h2>
          </div>
          <Link href="/auctions" className="inline-flex items-center gap-2 text-sm font-black text-[#D96C2D] transition hover:gap-3">
            Shiko te gjitha <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {activeAuctions.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {activeAuctions.map((auction, index) => (
                <div key={auction.id} className="reveal-up" style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}>
                  <BrandAuctionCard auction={auction} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auctions"
                className="rounded-full border border-[#D96C2D]/35 bg-white px-7 py-3 text-sm font-black text-[#D96C2D] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#D96C2D] hover:text-white"
              >
                Shiko te gjitha ankandet
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-[22px] border border-[#f0d9c4] bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-black text-[#352B24]">Nuk ka ankande aktive</h3>
            <p className="mt-2 text-sm text-[#6f5b4c]">Kontrollo perseri se shpejti.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pt-8">
        <div className="grid gap-3 rounded-[22px] border border-[#f0d9c4] bg-white p-5 shadow-sm md:grid-cols-[auto_1fr_1fr] md:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F7D8B5]/85 text-[#D96C2D]">
            <Truck className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-[#352B24]">Kosove: 3 EUR, dorezim 1-2 dite pune.</p>
          <p className="text-sm font-bold text-[#352B24]">Shqiperi: 5 EUR, dorezim 4-5 dite pune.</p>
        </div>
      </section>

      <section id="si-funksionon" className="mx-auto max-w-[1320px] px-4 pt-8">
        <div className="reveal-up rounded-[24px] border border-[#f0d9c4] bg-white/82 p-5 shadow-[0_18px_55px_rgba(53,43,36,0.05)] md:p-7">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">Proces i thjeshte</p>
              <h2 className="mt-2 text-3xl font-black text-[#352B24]">Si funksionon</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#6f5b4c]">
              Nga zgjedhja e produktit deri te dorezimi, cdo hap eshte i qarte.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {processItems.map(({ icon: Icon, title, copy }, index) => (
              <div key={title} className="group relative rounded-2xl border border-[#f0d9c4] bg-[#fffaf5] p-5 transition hover:-translate-y-1 hover:border-[#D96C2D]/55 hover:bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F7D8B5]/85 text-[#D96C2D] transition group-hover:bg-[#D96C2D] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-black text-[#d9b18b]">0{index + 1}</span>
                </div>
                <p className="font-black text-[#352B24]">{title}</p>
                <p className="mt-2 text-xs leading-5 text-[#7a6758]">{copy}</p>
                {index < processItems.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-[#e5b789] md:block" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
