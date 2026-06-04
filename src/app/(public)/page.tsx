import React from "react";
import Link from "next/link";
import { getAuctions, getCategories } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Gavel,
  Headphones,
  Home,
  Monitor,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sofa,
  Sparkles,
  Trophy,
  Truck,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const revalidate = 0;

function splitTime(endTime?: string) {
  const diff = endTime ? Math.max(0, new Date(endTime).getTime() - Date.now()) : 0;
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return [
    { label: "ore", value: String(hours).padStart(2, "0") },
    { label: "min", value: String(minutes).padStart(2, "0") },
    { label: "sek", value: String(seconds).padStart(2, "0") },
  ];
}

const trustItems: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: PackageCheck, title: "Produkte te kontrolluara", copy: "Cdo artikull testohet para ankandit." },
  { icon: Gavel, title: "Ankande live", copy: "Oferto ne kohe reale dhe ndiq garen." },
  { icon: ShieldCheck, title: "Te sigurta", copy: "Profile te verifikuara dhe monitorim aktiv." },
  { icon: RotateCcw, title: "Proces i qarte", copy: "Fituesi dhe porosia ruhen automatikisht." },
];

const processItems: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: Search, title: "Gjej produktin", copy: "Zgjidh ankandet qe te interesojne." },
  { icon: Gavel, title: "Bej oferten", copy: "Vendos oferten dhe ndiq garen live." },
  { icon: Trophy, title: "Fito ankandin", copy: "Oferta me e larte fiton ne fund." },
  { icon: ShoppingBag, title: "Merr produktin", copy: "Pagese ne dorezim dhe status porosie." },
];

const categoryIconPool = [Home, Monitor, Sparkles, Utensils, Sofa, Trophy, BadgeCheck];

export default async function HomePage() {
  const [allAuctions, categories] = await Promise.all([getAuctions(), getCategories()]);
  const activeAuctions = allAuctions.filter((auction) => auction.status === "active");
  const featured = activeAuctions[0];
  const hotAuctions = activeAuctions.slice(0, 4);

  return (
    <div className="pb-10">
      <PollingRefresh intervalMs={15000} />

      <section className="mx-auto max-w-[1320px] px-4 pt-5">
        <div className="relative overflow-hidden rounded-[18px] bg-[#fff2e5] shadow-[0_24px_70px_rgba(217,108,45,0.08)]">
          <div className="grid min-h-[380px] items-center lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative z-10 px-7 py-9 sm:px-11 lg:px-12">
              <h1 className="max-w-[430px] text-[3.05rem] font-black leading-[0.96] tracking-[-0.055em] text-[#352B24] sm:text-[4.1rem]">
                Oferto. Fito. Merre me <span className="text-[#D96C2D]">nje klik.</span>
              </h1>
              <p className="mt-5 max-w-[390px] text-[15px] leading-7 text-[#5f5148]">
                Ankande live cdo dite per produkte te zgjedhura me cmime qe ia vlejne.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/auctions" className="rounded-lg bg-[#D96C2D] px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520]">
                  Shiko ankandet
                </Link>
                <Link href="/how-it-works" className="rounded-lg border border-[#D96C2D]/35 bg-white/45 px-6 py-3 text-sm font-black text-[#D96C2D] transition hover:bg-white">
                  Si funksionon
                </Link>
              </div>
            </div>

            <div className="relative h-full min-h-[360px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/home-hero-scene.png"
                alt="Produkte shtepie te zgjedhura per ankand"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#fff2e5] to-transparent" />
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#D96C2D]" />
                <span className="h-2 w-2 rounded-full bg-[#ead2bc]" />
                <span className="h-2 w-2 rounded-full bg-[#ead2bc]" />
                <span className="h-2 w-2 rounded-full bg-[#ead2bc]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4">
        <div className="-mt-1 grid gap-4 rounded-b-[20px] border border-t-0 border-[#f0d9c4] bg-[#fffaf5] px-6 py-4 shadow-[0_16px_36px_rgba(53,43,36,0.04)] md:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7D8B5]/70 text-[#D96C2D]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-[#352B24]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#7a6758]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="mx-auto max-w-[1320px] px-4 pt-8">
          <div className="grid overflow-hidden rounded-[18px] border border-[#D96C2D]/70 bg-white shadow-[0_18px_50px_rgba(217,108,45,0.08)] md:grid-cols-[0.9fr_1.4fr]">
            <div className="bg-[#fff4e8] p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.product?.images?.[0] || "/brand/home-feature-product.png"}
                alt={featured.product?.title || "Produkt ne ankand"}
                className="h-56 w-full rounded-xl object-cover md:h-full"
              />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-md bg-[#D96C2D] px-3 py-1 text-xs font-black uppercase text-white">Live</span>
                <Link href={`/auctions/${featured.id}`} className="text-[#D96C2D] transition hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.03em] text-[#352B24]">{featured.product?.title}</h2>
              <p className="mt-1 text-sm text-[#7a6758]">{featured.category?.name || "Kategori"}</p>

              <div className="mt-5 grid gap-5 border-y border-[#f0d9c4] py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8a7565]">Oferta aktuale</p>
                  <p className="mt-2 text-4xl font-black text-[#D96C2D]">{formatEurFromAll(featured.current_price)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8a7565]">Statusi</p>
                  <p className="mt-2 text-4xl font-black text-[#352B24]">Live</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-4">
                <div className="flex gap-2">
                  {splitTime(featured.end_time).map((part) => (
                    <div key={part.label} className="min-w-16 rounded-lg border border-[#f0d9c4] bg-[#fffaf5] px-3 py-2 text-center">
                      <p className="text-lg font-black text-[#352B24]">{part.value}</p>
                      <p className="text-[10px] font-bold uppercase text-[#8a7565]">{part.label}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/auctions/${featured.id}`} className="min-w-48 flex-1 rounded-lg bg-[#D96C2D] px-6 py-3 text-center text-sm font-black text-white transition hover:bg-[#bf5520]">
                  Bej oferte
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1320px] px-4 pt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Ankandet aktive</h2>
          <Link href="/auctions" className="inline-flex items-center gap-2 text-sm font-black text-[#D96C2D]">
            Shiko te gjitha <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {hotAuctions.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {hotAuctions.map((auction) => (
              <BrandAuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#f0d9c4] bg-white p-8 text-center">
            <h3 className="text-lg font-black text-[#352B24]">Nuk ka ankande aktive</h3>
            <p className="mt-2 text-sm text-[#6f5b4c]">Kontrollo perseri se shpejti.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Kategorite kryesore</h2>
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-black text-[#D96C2D]">
            Shiko te gjitha <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {categories.slice(0, 7).map((category, index) => {
            const Icon = categoryIconPool[index % categoryIconPool.length];
            return (
              <Link key={category.id} href={`/auctions?category=${category.slug}`} className="group rounded-[14px] border border-[#f0d9c4] bg-[#fffaf5] p-5 text-center transition hover:-translate-y-0.5 hover:border-[#D96C2D]/60 hover:bg-white">
                <Icon className="mx-auto h-8 w-8 text-[#D96C2D]" />
                <p className="mt-3 text-sm font-black leading-5 text-[#352B24]">{category.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pt-10">
        <h2 className="mb-5 text-2xl font-black tracking-[-0.02em] text-[#352B24]">Si funksionon</h2>
        <div className="grid gap-4 rounded-[18px] border border-[#f0d9c4] bg-white/80 p-6 md:grid-cols-4">
          {processItems.map(({ icon: Icon, title, copy }, index) => (
            <div key={title} className="relative flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7D8B5]/80 text-[#D96C2D]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-[#352B24]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#7a6758]">{copy}</p>
              </div>
              {index < processItems.length - 1 ? <ArrowRight className="absolute -right-2 top-4 hidden h-4 w-4 text-[#e5b789] md:block" /> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pt-8">
        <div className="grid gap-4 rounded-[18px] bg-[#fff0dc] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#f0d9c4] bg-white text-[#D96C2D]">
              <BellRing className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-black text-[#352B24]">Mos humb asnje oferte!</h3>
              <p className="mt-1 text-sm text-[#6f5b4c]">Regjistrohu dhe merr njoftime per ankandet me te mira.</p>
            </div>
          </div>
          <form className="grid gap-3 sm:grid-cols-[260px_auto]">
            <input className="brand-focus h-12 rounded-lg border border-[#ead2bc] bg-white px-4 text-sm" placeholder="Email yt" />
            <Link href="/register" className="rounded-lg bg-[#D96C2D] px-8 py-3 text-center text-sm font-black text-white">
              Regjistrohu
            </Link>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-4 px-4 pt-8 md:grid-cols-4">
        {[
          { icon: BadgeCheck, title: "Cmime te mira", copy: "Produkte cilesore me cmime konkurruese." },
          { icon: ShieldCheck, title: "Te sigurta", copy: "Pagese e sigurt dhe dorezim i besueshem." },
          { icon: Headphones, title: "Ndihme aktive", copy: "Mbeshteje kur ke pyetje." },
          { icon: Truck, title: "Dergese e qarte", copy: "Status porosie nga fitimi deri te dorezimi." },
        ].map(({ icon: Icon, title, copy }) => (
          <div key={title} className="flex gap-3 rounded-[14px] border border-[#f0d9c4] bg-[#fffaf5] p-4">
            <Icon className="h-6 w-6 shrink-0 text-[#D96C2D]" />
            <div>
              <p className="text-sm font-black text-[#352B24]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#7a6758]">{copy}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
