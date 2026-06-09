import React from "react";
import Link from "next/link";
import { Home, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { AdminSidebarNav, type AdminSidebarIconKey } from "@/app/components/AdminUi";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandLogo } from "@/app/components/BrandUi";

export const revalidate = 0;

const links: { href: string; label: string; icon: AdminSidebarIconKey }[] = [
  { href: "/admin", label: "Permbledhje", icon: "overview" },
  { href: "/admin/auctions", label: "Ankandet", icon: "auctions" },
  { href: "/admin/bids", label: "Ofertat", icon: "bids" },
  { href: "/admin/orders", label: "Porosite", icon: "orders" },
  { href: "/admin/users", label: "Klientet", icon: "users" },
  { href: "/admin/categories", label: "Kategorite", icon: "categories" },
  { href: "/admin/audit-logs", label: "Aktiviteti", icon: "logs" },
  { href: "/admin/settings", label: "Cilesimet", icon: "settings" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen brand-surface text-[#352B24]">
      <PollingRefresh intervalMs={10000} />
      <header className="border-b border-[#f0d9c4] bg-[#fffdf8]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3 text-xl font-black text-[#352B24]">
            <BrandLogo compact className="sm:hidden" />
            <BrandLogo className="hidden sm:inline-flex" />
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D96C2D] text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="hidden sm:inline">NjeKlik Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#f0d9c4] bg-white px-4 py-2 text-sm font-bold text-[#6f5b4c] hover:text-[#D96C2D]">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Sajti</span>
            </Link>
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-full border border-[#f0d9c4] bg-white px-4 py-2 text-sm font-bold text-[#6f5b4c] hover:text-red-600">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Dil</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit min-w-0 overflow-hidden rounded-[24px] border border-[#f0d9c4] bg-white/86 p-3 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
          <AdminSidebarNav links={links} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}


