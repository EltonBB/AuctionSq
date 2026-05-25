import React from "react";
import Link from "next/link";
import { getSimulatedUser } from "@/lib/db";
import { signOut } from "@/app/actions/auth";
import { Gavel, LayoutDashboard, ShieldCheck, LogOut, LogIn, UserPlus } from "lucide-react";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSimulatedUser();
  const isLoggedIn = user && user.id !== "usr-guest";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header */}
      <header className="sticky top-[45px] z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-wider text-white">
            <Gavel className="w-7 h-7 text-blue-500 transform -rotate-45" />
            <span>OFERTO<span className="text-blue-500">.</span></span>
          </Link>

          {/* Nav Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <Link href="/auctions" className="hover:text-blue-400 transition-colors">Ankandet</Link>
            <Link href="/ending-soon" className="hover:text-blue-400 transition-colors">Drejt Përfundimit</Link>
            <Link href="/how-it-works" className="hover:text-blue-400 transition-colors">Si Funksionon</Link>
            <Link href="/winners" className="hover:text-blue-400 transition-colors">Fituesit</Link>
            <Link href="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Kontakt</Link>
          </nav>

          {/* User Status Options */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Hyni</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-blue-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Regjistrohu</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Paneli Im</span>
                </Link>

                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 font-semibold text-sm transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-transparent hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </main>

      {/* Elegant Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-sm">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <span className="font-black text-xl text-white tracking-wider">
              OFERTO<span className="text-blue-500">.</span>
            </span>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Oferto. Garo. Fito. Platforma më e sigurtë dhe transparente e ankandeve online në Shqipëri.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Lidhje të Shpejta</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/auctions" className="hover:text-blue-400 transition-colors">Shfleto Ankande</Link></li>
              <li><Link href="/ending-soon" className="hover:text-blue-400 transition-colors">Ankandet që po Mbyllen</Link></li>
              <li><Link href="/winners" className="hover:text-blue-400 transition-colors">Fituesit e Fundit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Rreth Nesh</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors">Si Funksionon</Link></li>
              <li><Link href="/faq" className="hover:text-blue-400 transition-colors">Pyetjet e Shpeshta</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Na Kontaktoni</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Siguria & Garancia</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Të gjitha produktet postohen dhe kontrollohen ekskluzivisht nga ekipi i administratorëve. Nuk ka shitës të tretë!
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              100% Produkte Reale
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-900 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Oferto Auctions. Të gjitha të drejtat të rezervuara.</span>
          <div className="flex gap-4">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Rregullorja</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Privatësia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
