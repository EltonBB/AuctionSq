import React from "react";
import Link from "next/link";
import { getAuditLogs, getAuctions, getBidsForAuction, getOrders, getProducts, getProfiles } from "@/lib/db";
import { runAuctionCloser } from "@/app/actions/admin";
import { ArrowRight, Boxes, Gavel, ShoppingBag, Users, type LucideIcon } from "lucide-react";

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const [products, auctions, orders, users, logs] = await Promise.all([
    getProducts(),
    getAuctions(),
    getOrders(),
    getProfiles(),
    getAuditLogs(),
  ]);
  const bidGroups = await Promise.all(auctions.map((auction) => getBidsForAuction(auction.id)));
  const bidsCount = bidGroups.flat().length;
  const activeAuctions = auctions.filter((auction) => auction.status === "active").length;
  const openOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const statCards: [string, number, LucideIcon, string][] = [
    ["Products", products.length, Boxes, "/admin/products"],
    ["Active auctions", activeAuctions, Gavel, "/admin/auctions"],
    ["Total bids", bidsCount, Users, "/admin/bids"],
    ["Users", users.length, Users, "/admin/users"],
    ["Open orders", openOrders, ShoppingBag, "/admin/orders"],
  ];

  async function closeExpiredAuctions() {
    "use server";
    await runAuctionCloser();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#082047] p-6 text-white md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-blue-200">Control center</p>
          <h1 className="mt-2 text-3xl font-black">AuctionSq operations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Manage inventory, schedule auctions, track bids, process orders, and watch platform activity from one place.</p>
        </div>
        <form action={closeExpiredAuctions}>
          <button className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#082047] hover:bg-blue-50">Close expired auctions</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {statCards.map(([label, value, Icon, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Icon className="h-6 w-6 text-blue-700" />
            <div className="mt-4 text-3xl font-black">{value}</div>
            <div className="mt-1 text-sm font-bold text-slate-500">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Auctions needing attention</h2>
            <Link href="/admin/auctions" className="flex items-center gap-1 text-sm font-bold text-blue-700">Open <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3">
            {auctions.slice(0, 6).map((auction) => (
              <div key={auction.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="font-bold text-slate-900">{auction.product?.title}</p>
                  <p className="text-xs text-slate-500">{auction.status} · ends {new Date(auction.end_time).toLocaleString()}</p>
                </div>
                <span className="text-sm font-black text-blue-700">{auction.current_price.toLocaleString()} L</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Recent audit activity</h2>
            <Link href="/admin/audit-logs" className="flex items-center gap-1 text-sm font-bold text-blue-700">Open <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-500">{log.performer?.full_name || "System"} · {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
