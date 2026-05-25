import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionById, getAuctions, getBidsForAuction, getCurrentUserProfile } from "@/lib/db";
import BiddingForm from "@/app/components/BiddingForm";
import { AlertTriangle, ChevronRight, Heart, RotateCcw, ShieldCheck, Truck, UserCheck } from "lucide-react";

export const revalidate = 0;

interface AuctionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatTime(endTime: string) {
  const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function maskName(name: string) {
  if (!name) return "Perdorues";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0].slice(0, 2)}*** ${parts[1].slice(0, 1)}.`;
  return `${name.slice(0, 3)}***`;
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { id: auctionId } = await params;
  const auc = await getAuctionById(auctionId);

  if (!auc) notFound();

  const bids = await getBidsForAuction(auctionId);
  const activeBids = bids.filter((bid) => bid.status === "active");
  const user = await getCurrentUserProfile();
  const isLoggedIn = user && user.id !== "usr-guest";
  const isProfileComplete =
    isLoggedIn &&
    !!user.full_name &&
    !!user.phone_number &&
    !!user.city &&
    !!user.address;

  const relatedAuctions = (await getAuctions())
    .filter((auction) => auction.id !== auctionId && auction.status === "active")
    .slice(0, 4);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8">
        <div className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-blue-700">Ballina</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/auctions" className="hover:text-blue-700">Ankandet</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-slate-400">{auc.product?.title}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                alt={auc.product?.title}
                className="aspect-[1.18] w-full object-cover"
              />
              <span className="absolute left-5 top-5 rounded-full bg-[#082047] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                Ankand aktiv
              </span>
              <button className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 backdrop-blur" aria-label="Save auction">
                <Heart className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-slate-950">Pershkrimi i produktit</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {auc.product?.description}
              </p>

              {auc.product?.testing_notes && (
                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-blue-800">
                    <ShieldCheck className="h-5 w-5" />
                    Raporti i kontrollit teknik
                  </div>
                  <p className="mt-3 text-sm leading-6 text-blue-950">&ldquo;{auc.product.testing_notes}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 bg-slate-50 p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    {auc.category?.name || "Kategori"}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase text-blue-800">
                    Aktiv
                  </span>
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] text-slate-950">
                  {auc.product?.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="p-6">
                  <div className="text-xs font-bold uppercase text-slate-400">Cmimi fillestar</div>
                  <div className="mt-2 text-lg font-black text-slate-700">{auc.starting_price.toLocaleString()} L</div>
                </div>
                <div className="border-l border-slate-200 p-6 text-right">
                  <div className="text-xs font-bold uppercase text-slate-400">Oferte aktive</div>
                  <div className="mt-2 text-3xl font-black text-blue-700">{auc.current_price.toLocaleString()} L</div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-200 bg-[#082047] text-white">
                <div className="p-5">
                  <div className="text-xs font-bold uppercase text-blue-100">Koha e mbetur</div>
                  <div className="mt-2 text-lg font-black">{formatTime(auc.end_time)}</div>
                </div>
                <div className="border-l border-white/10 p-5 text-right">
                  <div className="text-xs font-bold uppercase text-blue-100">Oferta</div>
                  <div className="mt-2 text-lg font-black">{activeBids.length} bide</div>
                </div>
              </div>

              <div className="bg-[#082047] p-5">
                <BiddingForm
                  auctionId={auc.id}
                  currentPrice={auc.current_price}
                  minIncrement={auc.min_increment}
                  isLoggedIn={isLoggedIn}
                  isProfileComplete={isProfileComplete}
                  isBlocked={user?.is_blocked || false}
                  hasBids={activeBids.length > 0}
                  startingPrice={auc.starting_price}
                />
              </div>

              <div className="space-y-3 p-6 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-700" />
                  Dergese e sigurt me pagese ne dorezim
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-blue-700" />
                  Produkt i kontrolluar nga administratoret
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-700" />
                  Oferta te rreme kufizohen nga platforma
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black tracking-[-0.02em] text-slate-950">Historia e ofertave</h2>
            {bids.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                Nuk ka ende oferta. Behu i pari qe oferton.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {bids.map((bid, index) => {
                  const isLeader = bid.status === "active" && index === 0;
                  return (
                    <div key={bid.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{maskName(bid.user?.full_name)}</span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase text-blue-800">
                              <UserCheck className="h-3 w-3" />
                              Ne krye
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(bid.created_at).toLocaleString("sq-AL")}
                        </div>
                      </div>
                      <div className="text-lg font-black text-blue-700">{bid.amount.toLocaleString()} L</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-black tracking-[-0.02em] text-slate-950">Ankande te tjera</h2>
            <div className="mt-5 space-y-4">
              {relatedAuctions.map((auction) => (
                <Link key={auction.id} href={`/auctions/${auction.id}`} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={auction.product?.images?.[0]} alt={auction.product?.title} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-sm font-bold text-slate-950">{auction.product?.title}</div>
                    <div className="mt-2 text-sm font-black text-blue-700">{auction.current_price.toLocaleString()} L</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
