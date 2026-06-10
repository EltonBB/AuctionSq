import React from "react";
import Link from "next/link";
import { getCategories, getCurrentUserProfile } from "@/lib/db";
import { signOut } from "@/app/actions/auth";
import { BrandLogo } from "@/app/components/BrandUi";
import MobilePublicMenu from "@/app/components/MobilePublicMenu";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Gamepad2,
  Gavel,
  Grid2X2,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();
  const categories = await getCategories();
  const isLoggedIn = user && user.id !== "usr-guest";
  const categoryIcons = [Home, Monitor, Sparkles, Wrench, Gamepad2, Trophy, Grid2X2];

  const navLinks = [
    { href: "/", label: "Ballina", icon: Home },
    { href: "/auctions", label: "Ankandet", icon: Gavel },
  ];

  return (
    <div className="brand-surface min-h-screen text-[#352B24] lg:grid lg:grid-cols-[284px_minmax(0,1fr)] xl:grid-cols-[304px_minmax(0,1fr)]">
      <aside className="top-0 z-40 hidden h-screen self-start border-r border-[#f0d9c4] bg-[#fffdf8]/90 px-6 py-6 backdrop-blur lg:sticky lg:block xl:px-7">
        <BrandLogo className="px-1" />
        <Link
          href={user?.is_admin ? "/admin/auctions" : "/auctions"}
          className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#D96C2D] px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520]"
        >
          <Gavel className="h-4 w-4" />
          {user?.is_admin ? "Shto produkt" : "Shiko ankandet"}
        </Link>

        <nav className="mt-7 grid gap-1 text-sm">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 font-bold text-[#5e4c3f] transition hover:bg-[#F7D8B5]/50 hover:text-[#D96C2D]">
              <Icon className="h-4 w-4 text-[#D96C2D]" />
              {label}
            </Link>
          ))}
          <Link href="/categories" className="mt-2 flex items-center justify-between rounded-xl px-3 py-3 font-bold text-[#5e4c3f] transition hover:bg-[#F7D8B5]/50 hover:text-[#D96C2D]">
            <span className="inline-flex items-center gap-3">
              <Grid2X2 className="h-4 w-4 text-[#D96C2D]" />
              Kategorite
            </span>
            <ChevronDown className="h-4 w-4 text-[#8a7565]" />
          </Link>
          {categories.slice(0, 7).map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link key={category.id} href={`/auctions?category=${category.slug}`} className="ml-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#6f5b4c] transition hover:bg-[#F7D8B5]/45 hover:text-[#D96C2D]">
                <Icon className="h-4 w-4 text-[#D96C2D]/75" />
                {category.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-[#f0d9c4] pt-5 text-sm">
          <Link href="/winners" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-[#6f5b4c] hover:bg-[#F7D8B5]/45">
            <Trophy className="h-4 w-4 text-[#D96C2D]" />
            Fituesit
          </Link>
          <Link href="/how-it-works" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-[#6f5b4c] hover:bg-[#F7D8B5]/45">
            <HelpCircle className="h-4 w-4 text-[#D96C2D]" />
            Si funksionon
          </Link>
        </div>

        <div className="absolute bottom-5 left-6 right-6 rounded-2xl border border-[#f3d7b8] bg-[#fff0dc] p-4 shadow-[0_16px_32px_rgba(217,108,45,0.12)] xl:left-7 xl:right-7">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/gold-bidder-medal.png" alt="" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-sm font-black text-[#352B24]">Fito me shume.</p>
              <p className="mt-1 text-xs leading-5 text-[#6f5b4c]">Ankande te zgjedhura dhe cmime qe ia vlejne.</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-50 border-b border-[#f0d9c4] bg-[#fffdf8]/92 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3">
            <MobilePublicMenu />

            <BrandLogo compact className="lg:hidden" />

            <form action="/auctions" className="relative hidden max-w-[620px] flex-1 md:block">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7565]" />
              <input
                name="search"
                placeholder="Kerko produkte, kategori apo marka..."
                className="brand-focus h-12 w-full rounded-xl border border-[#ead2bc] bg-white/80 pl-14 pr-4 text-sm font-semibold text-[#352B24] placeholder:text-[#a99584]"
              />
            </form>

            <div className="ml-auto flex items-center gap-3">
              <Link href="/winners" className="hidden items-center gap-2 text-sm font-bold text-[#5e4c3f] hover:text-[#D96C2D] sm:flex">
                <Heart className="h-5 w-5" />
                Lista ime
              </Link>
              <button className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#f0d9c4] bg-white text-[#5e4c3f] transition hover:text-[#D96C2D] sm:flex" aria-label="Njoftime">
                <Bell className="h-5 w-5" />
              </button>

              {!isLoggedIn ? (
                <Link href="/login" className="rounded-full bg-[#352B24] px-4 py-3 text-xs font-black text-white transition hover:bg-[#D96C2D] sm:px-5 sm:text-sm">
                  <span className="sm:hidden">Kycu</span>
                  <span className="hidden sm:inline">Kycu / Regjistrohu</span>
                </Link>
              ) : (
                <>
                  {user?.is_admin ? (
                    <Link href="/admin" className="hidden items-center gap-2 rounded-full border border-[#F7D8B5] bg-[#F7D8B5]/60 px-4 py-3 text-sm font-black text-[#D96C2D] transition hover:bg-[#F7D8B5] sm:flex">
                      <ShieldCheck className="h-4 w-4" />
                      Paneli Admin
                    </Link>
                  ) : (
                    <details className="relative hidden sm:block">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#f0d9c4] bg-white px-3 py-2 text-sm font-black text-[#5e4c3f] transition hover:text-[#D96C2D]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F7D8B5] text-xs font-black uppercase text-[#D96C2D]">
                          {(user?.full_name || "U").slice(0, 2)}
                        </span>
                        <span>Llogaria</span>
                        <ChevronDown className="h-4 w-4" />
                      </summary>
                      <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-[#f0d9c4] bg-white shadow-xl">
                        <div className="border-b border-[#f0d9c4] px-4 py-3">
                          <p className="font-black text-[#352B24]">{user?.full_name || "Perdorues"}</p>
                          <p className="truncate text-xs text-[#8a7565]">{user?.email || "N/A"}</p>
                        </div>
                        <div className="grid p-2 text-sm">
                          <Link href="/dashboard/profile" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-[#5e4c3f] transition hover:bg-[#FFF8F1]">
                            <CircleUserRound className="h-4 w-4 text-[#D96C2D]" />
                            Profili
                          </Link>
                          <Link href="/dashboard/orders" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-[#5e4c3f] transition hover:bg-[#FFF8F1]">
                            <Gavel className="h-4 w-4 text-[#D96C2D]" />
                            Porosite e Mia
                          </Link>
                        </div>
                      </div>
                    </details>
                  )}
                  <form action={signOut}>
                    <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0d9c4] bg-white text-[#5e4c3f] transition hover:text-[#D96C2D]" aria-label="Dil">
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-[#f0d9c4] bg-[#fffdf8] py-10">
          <div className="mx-auto grid max-w-[1500px] gap-8 px-4 md:grid-cols-4">
            <div>
              <BrandLogo />
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#6f5b4c]">
                Ankande online per produkte reale, te kontrolluara dhe te menaxhuara nga ekipi yne.
              </p>
            </div>
            <div>
              <h4 className="font-black text-[#352B24]">Lidhje</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-[#6f5b4c]">
                <Link href="/auctions">Te gjitha produktet</Link>
                <Link href="/ending-soon">Drejt perfundimit</Link>
                <Link href="/winners">Fituesit</Link>
              </div>
            </div>
            <div>
              <h4 className="font-black text-[#352B24]">Ndihme</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-[#6f5b4c]">
                <Link href="/how-it-works">Si funksionon</Link>
                <Link href="/faq">FAQ</Link>
                <Link href="/contact">Kontakt</Link>
              </div>
            </div>
            <div>
              <h4 className="font-black text-[#352B24]">Garancia NjeKlik</h4>
              <p className="mt-4 text-sm leading-6 text-[#6f5b4c]">
                Pa shites te trete. Produktet testohen, fotografohen dhe publikohen nga administratoret.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

