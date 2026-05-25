import React from "react";
import Link from "next/link";
import { getCategories, getSimulatedUser } from "@/lib/db";
import { signOut } from "@/app/actions/auth";
import {
  Bell,
  ChevronDown,
  Gamepad2,
  Gavel,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Wrench,
} from "lucide-react";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSimulatedUser();
  const categories = await getCategories();
  const isLoggedIn = user && user.id !== "usr-guest";

  const categoryIcons = [Gamepad2, Sparkles, Wrench, ShieldCheck, Gavel];

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-3">
          <Link href="/" className="shrink-0 text-[34px] font-black leading-none tracking-[-0.03em] text-[#082047]">
            oferto<span className="text-[#1d4ed8]">j</span><span className="text-slate-400">.com</span>
          </Link>

          <Link href="/" className="hidden text-sm font-semibold text-slate-900 lg:block">
            Ballina
          </Link>

          <form action="/auctions" className="relative hidden flex-1 md:block">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              placeholder="Kerko produktin qe deshiron..."
              className="h-12 w-full rounded-full border border-slate-200 bg-slate-100 pl-14 pr-24 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
            <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-400 lg:inline">
              Ctrl + K
            </span>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <button className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700 sm:flex" aria-label="Favorites">
              <Heart className="h-5 w-5" />
            </button>
            <button className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700 sm:flex" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>

            {!isLoggedIn ? (
              <Link
                href="/login"
                className="rounded-full bg-[#082047] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#12366d]"
              >
                Kycu / Regjistrohu
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 sm:flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Paneli Im
                </Link>
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 lg:flex"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <form action={signOut}>
                  <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-700" aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-[1440px] items-center gap-7 overflow-x-auto px-4 py-3 text-sm text-slate-700">
            <Link href="/categories" className="flex shrink-0 items-center gap-2 border-r border-slate-200 pr-7 font-semibold text-slate-900">
              Te gjitha kategorite
              <ChevronDown className="h-4 w-4" />
            </Link>
            {categories.slice(0, 5).map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];
              return (
                <Link key={category.id} href={`/auctions?category=${category.slug}`} className="flex shrink-0 items-center gap-2 font-medium transition hover:text-blue-700">
                  <Icon className="h-5 w-5 text-slate-500" />
                  {category.name}
                </Link>
              );
            })}
            <Link href="/login" className="ml-auto flex shrink-0 items-center gap-2 font-semibold text-blue-800 sm:hidden">
              <LogIn className="h-4 w-4" />
              Hyr
            </Link>
            <Link href="/register" className="hidden shrink-0 items-center gap-2 font-semibold text-blue-800 sm:flex lg:hidden">
              <UserPlus className="h-4 w-4" />
              Regjistrohu
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-[#082047] py-12 text-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 md:grid-cols-4">
          <div>
            <div className="text-3xl font-black tracking-[-0.03em]">ofertoj.com</div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-blue-100">
              Ankande online per produkte reale, te kontrolluara dhe te listuara nga ekipi yne.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Lidhje</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-blue-100">
              <Link href="/auctions">Te gjitha produktet</Link>
              <Link href="/ending-soon">Drejt perfundimit</Link>
              <Link href="/winners">Fituesit</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Ndihme</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-blue-100">
              <Link href="/how-it-works">Si funksionon</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Kontakt</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Garancia jone</h4>
            <p className="mt-4 text-sm leading-6 text-blue-100">
              Pa shites te trete. Produktet testohen, fotografohen dhe menaxhohen nga administratoret.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
