import React from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { BarChart3, Boxes, ClipboardList, FolderTree, Gavel, Home, LogOut, ScrollText, Settings, ShieldCheck, ShoppingBag, Users } from "lucide-react";

export const revalidate = 0;

const links = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/auctions", label: "Auctions", icon: Gavel },
  { href: "/admin/bids", label: "Bids", icon: ClipboardList },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
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
              Site
            </Link>
            <form action={signOut}>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="grid gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#082047]">
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
