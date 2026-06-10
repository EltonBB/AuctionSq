import React from "react";
import Link from "next/link";
import { getAdminActiveBids, getAdminBidCount, getAuditLogs, getAuctions, getOrders, getProducts, getProfiles } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import { ArrowRight, Award, Boxes, Gavel, ShoppingBag, Users, type LucideIcon } from "lucide-react";

export const revalidate = 0;

type AdminActiveBid = Awaited<ReturnType<typeof getAdminActiveBids>>[number];

export default async function AdminOverviewPage() {
  const [products, auctions, orders, users, logs, bids, bidsCount] = await Promise.all([
    getProducts(),
    getAuctions(),
    getOrders(),
    getProfiles(),
    getAuditLogs(),
    getAdminActiveBids(),
    getAdminBidCount(),
  ]);
  const activeAuctions = auctions.filter((auction) => auction.status === "active").length;
  const bidCountsByAuctionId = new Map<string, number>();
  const highestActiveBids: { auction: AdminActiveBid["auction"]; bid: AdminActiveBid; bidCount: number }[] = [];

  for (const bid of bids) {
    if (!["active", "scheduled"].includes(bid.auction.status)) continue;
    bidCountsByAuctionId.set(bid.auction_id, (bidCountsByAuctionId.get(bid.auction_id) || 0) + 1);
    if (!highestActiveBids.some((item) => item.auction.id === bid.auction_id)) {
      highestActiveBids.push({ auction: bid.auction, bid, bidCount: 0 });
    }
  }

  for (const item of highestActiveBids) {
    item.bidCount = bidCountsByAuctionId.get(item.auction.id) || 0;
  }

  highestActiveBids.splice(6);
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
      <div className="rounded-2xl bg-[#fff3e6] p-6 text-[#352B24] border border-[#f0d9c4]">
        <p className="text-sm font-bold uppercase text-[#D96C2D]">Qendra e kontrollit</p>
        <h1 className="mt-2 text-3xl font-black">Operacionet e NjeKlik</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5b4c]">
          Ankandet e skaduara mbyllen automatikisht. Fituesit dhe porosite krijohen automatikisht ne sistem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {statCards.map(([label, value, Icon, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Icon className="h-6 w-6 text-[#D96C2D]" />
            <div className="mt-4 text-3xl font-black">{value}</div>
            <div className="mt-1 text-sm font-bold text-[#6f5b4c]">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Fituesit e fundit</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-[#D96C2D]">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {recentWinners.length === 0 ? (
              <p className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 text-sm text-[#6f5b4c]">Nuk ka ankande te mbyllura me fitues ende.</p>
            ) : (
              recentWinners.map((order) => (
                <div key={order.id} className="grid gap-3 rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-[#352B24]">{order.auction?.product?.title}</p>
                    <p className="text-xs text-[#6f5b4c]">Fituesi: {order.winner?.full_name || "I panjohur"} - {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="inline-flex items-center gap-1 text-xs font-bold uppercase text-emerald-700">
                      <Award className="h-3.5 w-3.5" />
                      Fitues
                    </p>
                    <p className="text-sm font-black text-[#D96C2D]">{formatEurFromAll(order.final_price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Ankandet aktive</h2>
            <Link href="/admin/auctions" className="flex items-center gap-1 text-sm font-bold text-[#D96C2D]">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {auctions
              .filter((auction) => auction.status === "active" || auction.status === "scheduled")
              .slice(0, 6)
              .map((auction) => (
                <div key={auction.id} className="grid gap-3 rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-[#352B24]">{auction.product?.title}</p>
                    <p className="text-xs text-[#6f5b4c]">{auction.status} - mbaron me {new Date(auction.end_time).toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#D96C2D] sm:text-right">{formatEurFromAll(auction.current_price)}</span>
                </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Ofertat aktive me te larta</h2>
            <Link href="/admin/bids" className="flex items-center gap-1 text-sm font-bold text-[#D96C2D]">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {highestActiveBids.length === 0 ? (
              <p className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 text-sm text-[#6f5b4c]">
                Ende nuk ka oferta aktive nga klientet.
              </p>
            ) : (
              highestActiveBids.map(({ auction, bid, bidCount }) => (
                <div key={auction.id} className="grid gap-3 rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#352B24]">{auction.product?.title}</p>
                    <p className="text-xs text-[#6f5b4c]">
                      {bid.user?.full_name || "Klient"} - {bidCount} {bidCount === 1 ? "oferte" : "oferta"}
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="text-sm font-black text-[#D96C2D]">{formatEurFromAll(bid.amount)}</p>
                    <p className="text-[11px] font-semibold uppercase text-[#8a7565]">me e larta</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Aktiviteti i fundit</h2>
            <Link href="/admin/audit-logs" className="flex items-center gap-1 text-sm font-bold text-[#D96C2D]">
              Hap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-3">
                <p className="font-bold text-[#352B24]">{log.action}</p>
                <p className="text-xs text-[#6f5b4c]">{log.performer?.full_name || "Sistem"} - {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}



