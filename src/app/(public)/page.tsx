import React from "react";
import Link from "next/link";
import { getAuctions, getCategories } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import { ArrowRight, BadgeCheck, BellRing, Gavel, PackageCheck, Search, ShieldCheck, Truck } from "lucide-react";

export const revalidate = 0;

function splitTime(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return [
    { label: "ore", value: String(hours).padStart(2, "0") },
    { label: "min", value: String(minutes).padStart(2, "0") },
    { label: "sek", value: String(seconds).padStart(2, "0") },
  ];
}

export default async function HomePage() {
  const [allAuctions, categories] = await Promise.all([getAuctions(), getCategories()]);
  const activeAuctions = allAuctions.filter((auction) => auction.status === "active");
  const featured = activeAuctions[0];
  const hotAuctions = activeAuctions.slice(0, 4);

  return (
    <div>
      <PollingRefresh intervalMs={15000} />
      <section className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 xl:grid-cols-[1fr_420px]">
        <div className="relative overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-[#fff3e6] p-7 shadow-[0_22px_60px_rgba(53,43,36,0.08)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <h1 className="max-w-[480px] text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#352B24] md:text-7xl">
                Oferto. Fito. Merre me <span className="text-[#D96C2D]">nje klik.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-[#6f5b4c]">
                Ankande live Cdo dite per produkte te kontrolluara, me cmime qe ia vlejne dhe dergese te thjeshte.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/auctions" className="rounded-xl bg-[#D96C2D] px-6 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(217,108,45,0.24)] transition hover:bg-[#bf5520]">
                  Shiko ankandet
                </Link>
                <Link href="/how-it-works" className="rounded-xl border border-[#D96C2D]/35 bg-white/70 px-6 py-3 text-sm font-black text-[#D96C2D] transition hover:bg-white">
                  Si funksionon
                </Link>
              </div>
            </div>
            <div className="relative min-h-[340px] overflow-hidden rounded-[24px] bg-gradient-to-br from-white to-[#F7D8B5]/55">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured?.product?.images?.[0] || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&auto=format&fit=crop&q=80"}
                alt={featured?.product?.title || "Produkt i zgjedhur"}
                className="h-full min-h-[340px] w-full object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/70 bg-white/88 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wide text-[#D96C2D]">Ankand i zgjedhur</p>
                <p className="mt-1 line-clamp-1 text-lg font-black text-[#352B24]">{featured?.product?.title || "Produkti i dites"}</p>
                <p className="mt-2 text-2xl font-black text-[#D96C2D]">{featured ? formatEurFromAll(featured.current_price) : "€0.00"}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-5">
          {featured ? (
            <div className="rounded-[28px] border border-[#D96C2D]/45 bg-white p-5 shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#D96C2D]">
                  <span className="h-2 w-2 rounded-full bg-[#D96C2D]" />
                  Live auction
                </span>
                <Gavel className="h-5 w-5 text-[#D96C2D]" />
              </div>
              <h2 className="mt-4 line-clamp-2 text-2xl font-black tracking-[-0.02em] text-[#352B24]">{featured.product?.title}</h2>
              <p className="mt-1 text-sm text-[#8a7565]">{featured.category?.name || "Kategori"}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#f0d9c4] py-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#8a7565]">Oferta aktuale</p>
                  <p className="mt-1 text-3xl font-black text-[#D96C2D]">{formatEurFromAll(featured.current_price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-[#8a7565]">Oferta</p>
                  <p className="mt-1 text-3xl font-black text-[#352B24]">{featured.winning_bid_id ? "Fitues" : "Live"}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                {splitTime(featured.end_time).map((part) => (
                  <div key={part.label} className="flex-1 rounded-xl bg-[#FFF8F1] px-3 py-2 text-center">
                    <p className="text-lg font-black text-[#352B24]">{part.value}</p>
                    <p className="text-[10px] font-bold uppercase text-[#8a7565]">{part.label}</p>
                  </div>
                ))}
              </div>
              <Link href={`/auctions/${featured.id}`} className="mt-5 block rounded-xl bg-[#D96C2D] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#bf5520]">
                Bej oferte
              </Link>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#f0d9c4] bg-white p-6">
              <h2 className="text-xl font-black text-[#352B24]">Nuk ka ankande aktive</h2>
              <p className="mt-2 text-sm text-[#6f5b4c]">Kontrollo perseri se shpejti.</p>
            </div>
          )}

          <div className="grid gap-3 rounded-[24px] border border-[#f0d9c4] bg-[#fffdf8] p-5">
            {[
              [PackageCheck, "Produkte te kontrolluara", "Cdo produkt testohet perpara ankandit."],
              [ShieldCheck, "Ofertim i sigurt", "Profile te verifikuara dhe monitorim aktiv."],
              [Truck, "Dergese e besueshme", "Pagese ne dorezim dhe status porosie."],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#352B24]">{title as string}</p>
                  <p className="text-xs leading-5 text-[#8a7565]">{copy as string}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Ankandet aktive</h2>
          <Link href="/auctions" className="inline-flex items-center gap-2 text-sm font-black text-[#D96C2D]">
            Shiko te gjitha <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {hotAuctions.map((auction) => (
            <BrandAuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Kategorite kryesore</h2>
            <Link href="/categories" className="text-sm font-black text-[#D96C2D]">Shiko te gjitha</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {categories.slice(0, 7).map((category) => (
              <Link key={category.id} href={`/auctions?category=${category.slug}`} className="rounded-2xl border border-[#f0d9c4] bg-white/80 p-4 text-center shadow-sm transition hover:border-[#D96C2D]/45">
                <Gavel className="mx-auto h-6 w-6 text-[#D96C2D]" />
                <p className="mt-3 text-sm font-black text-[#352B24]">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-[#f0d9c4] bg-[#fffdf8] p-5">
          <h3 className="text-lg font-black text-[#352B24]">Mos humb asnje oferte</h3>
          <p className="mt-2 text-sm leading-6 text-[#6f5b4c]">Regjistrohu dhe merr njoftime per ankandet me te mira.</p>
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7565]" />
              <input className="brand-focus h-11 w-full rounded-xl border border-[#ead2bc] bg-white pl-11 pr-3 text-sm" placeholder="Email yt" />
            </div>
            <Link href="/register" className="rounded-xl bg-[#D96C2D] px-5 py-3 text-center text-sm font-black text-white">
              Regjistrohu
            </Link>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-12">
        <div className="grid gap-4 rounded-[24px] border border-[#f0d9c4] bg-white/80 p-5 md:grid-cols-4">
          {[
            [Search, "Gjej produktin", "Zgjidh ankandet qe te interesojne."],
            [Gavel, "Bej oferten", "Vendos oferten dhe ndiq garen live."],
            [BadgeCheck, "Fito ankandin", "Oferta me e larte fiton ne fund."],
            [BellRing, "Merr produktin", "Dergese e ndjekur dhe pagese ne dorezim."],
          ].map(([Icon, title, copy]) => (
            <div key={String(title)} className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7D8B5] text-[#D96C2D]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-[#352B24]">{title as string}</p>
                <p className="mt-1 text-xs leading-5 text-[#8a7565]">{copy as string}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

