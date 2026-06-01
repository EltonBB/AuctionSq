import React from "react";
import Link from "next/link";
import { Home, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { AdminSidebarNav, type AdminSidebarIconKey } from "@/app/components/AdminUi";
import PollingRefresh from "@/app/components/PollingRefresh";

export const revalidate = 0;

const links: { href: string; label: string; icon: AdminSidebarIconKey }[] = [
  { href: "/admin", label: "Permbledhje", icon: "overview" },
  { href: "/admin/products", label: "Produktet", icon: "products" },
  { href: "/admin/auctions", label: "Ankandet", icon: "auctions" },
  { href: "/admin/bids", label: "Ofertat", icon: "bids" },
  { href: "/admin/orders", label: "Porosite", icon: "orders" },
  { href: "/admin/users", label: "Klientet", icon: "users" },
  { href: "/admin/categories", label: "Kategorite", icon: "categories" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "logs" },
  { href: "/admin/settings", label: "Cilesimet", icon: "settings" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <PollingRefresh intervalMs={10000} />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3 text-xl font-black text-[#082047]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082047] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            AuctionSq Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-700">
              <Home className="h-4 w-4" />
              Sajti
            </Link>
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                Dil
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <AdminSidebarNav links={links} />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
