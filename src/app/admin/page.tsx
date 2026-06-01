import React from "react";
import Link from "next/link";
import { getAuditLogs, getAuctions, getBidsForAuction, getOrders, getProducts, getProfiles } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import { ArrowRight, Award, Boxes, Gavel, ShoppingBag, Users, type LucideIcon } from "lucide-react";

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
  const recentWinners = orders.slice(0, 5);
  const statCards: [string, number, LucideIcon, string][] = [
    ["Produktet", products.length, Boxes, "/admin/products"],
    ["Ankandet aktive", activeAuctions, Gavel, "/admin/auctions"],
    ["Ofertat totale", bidsCount, Users, "/admin/bids"],
    ["Perdoruesit", users.length, Users, "/admin/users"],
    ["Porosi te hapura", openOrders, ShoppingBag, "/admin/orders"],
  ];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-[#082047] p-6 text-white">
        <p className="text-sm font-bold uppercase text-blue-200">Qendra e kontrollit</p>
        <h1 className="mt-2 text-3xl font-black">Operacionet e AuctionSq</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
          Ankandet e skaduara mbyllen automatikisht. Fituesit dhe porosite krijohen automatikisht ne sistem.
        </p>
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
            <h2 className="font-black">Fituesit e fundit</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-blue-700">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {recentWinners.length === 0 ? (
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">Nuk ka ankande te mbyllura me fitues ende.</p>
            ) : (
              recentWinners.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-bold text-slate-900">{order.auction?.product?.title}</p>
                    <p className="text-xs text-slate-500">Fituesi: {order.winner?.full_name || "I panjohur"} • {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 text-xs font-bold uppercase text-emerald-700">
                      <Award className="h-3.5 w-3.5" />
                      Fitues
                    </p>
                    <p className="text-sm font-black text-blue-700">{formatEurFromAll(order.final_price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Ankandet aktive</h2>
            <Link href="/admin/auctions" className="flex items-center gap-1 text-sm font-bold text-blue-700">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {auctions
              .filter((auction) => auction.status === "active" || auction.status === "scheduled")
              .slice(0, 6)
              .map((auction) => (
                <div key={auction.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-bold text-slate-900">{auction.product?.title}</p>
                    <p className="text-xs text-slate-500">{auction.status} • mbaron me {new Date(auction.end_time).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-black text-blue-700">{formatEurFromAll(auction.current_price)}</span>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Audit logs te fundit</h2>
            <Link href="/admin/audit-logs" className="flex items-center gap-1 text-sm font-bold text-blue-700">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-500">{log.performer?.full_name || "Sistem"} • {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
