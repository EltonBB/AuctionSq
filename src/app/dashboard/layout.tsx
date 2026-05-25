import React from "react";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/db";
import {
  User,
  LayoutDashboard,
  Gavel,
  Award,
  ShoppingBag,
  MapPin,
  KeyRound,
  Home,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();

  const isProfileComplete =
    !!user?.full_name &&
    !!user?.phone_number &&
    !!user?.city &&
    !!user?.address;

  const sidebarLinks = [
    { href: "/dashboard", label: "Përmbledhje", icon: LayoutDashboard },
    { href: "/dashboard/bids", label: "Ofertat e Mia", icon: Gavel },
    { href: "/dashboard/won", label: "Ankandet e Fituara", icon: Award },
    { href: "/dashboard/orders", label: "Porositë e Mia", icon: ShoppingBag },
    { href: "/dashboard/profile", label: "Profili Im", icon: User },
    { href: "/dashboard/addresses", label: "Adresat", icon: MapPin },
    { href: "/dashboard/change-password", label: "Ndrysho Fjalëkalimin", icon: KeyRound }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Profile Incomplete Alert bar */}
      {!isProfileComplete && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>Ju lutemi plotësoni adresën tuaj dhe numrin e telefonit te faqja &quot;Profili Im&quot; për të aktivizuar ofertimin në ankande!</span>
        </div>
      )}

      {/* 2. Top Header Nav for Dashboard */}
      <header className="bg-slate-900 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wider text-white">
          <Gavel className="w-5.5 h-5.5 text-blue-500 transform -rotate-45" />
          <span>OFERTO<span className="text-blue-500">.</span></span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span>Kthehu në faqe</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 uppercase text-3xs">
              {user?.full_name?.substring(0, 2)}
            </div>
            <span className="font-bold text-slate-300">{user?.full_name}</span>
          </div>
        </div>
      </header>

      {/* 3. Main content body */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Sidebar Panel */}
        <aside className="w-full md:w-64 bg-slate-900/40 border-r border-slate-900 p-5 flex flex-col justify-between gap-6 flex-shrink-0">
          <nav className="flex flex-col gap-1.5 text-left">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 font-semibold text-xs transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <form action={signOut} className="border-t border-slate-900 pt-4 mt-auto">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 font-semibold text-xs text-left transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Dil nga Llogaria</span>
            </button>
          </form>
        </aside>

        {/* Right Dashboard viewport */}
        <main className="flex-grow p-6 sm:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
