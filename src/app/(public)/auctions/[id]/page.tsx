import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionById, getAuctions, getBidsForAuction, getCurrentUserProfile } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import BiddingForm from "@/app/components/BiddingForm";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import { AlertTriangle, Award, ChevronRight, Heart, RotateCcw, ShieldCheck, Truck, UserCheck } from "lucide-react";

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
  if (!name) return "Përdorues";
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
  const isOwnerAdmin = !!user?.is_admin;
  const isLoggedIn = user && user.id !== "usr-guest";
  const isProfileComplete =
    (isOwnerAdmin || isLoggedIn) &&
    !!user.full_name &&
    (isOwnerAdmin || (!!user.phone_number && !!user.city && !!user.address));
  const isAccountVerified = isOwnerAdmin || (isLoggedIn && !!user.email_verified);
  const isEnded = auc.status === "ended";
  const isWinner = isLoggedIn && auc.winner_id === user.id;

  const relatedAuctions = (await getAuctions())
    .filter((auction) => auction.id !== auctionId && auction.status === "active")
    .slice(0, 4);

  return (
    <div>
      <PollingRefresh intervalMs={10000} />
      <div className="mx-auto max-w-[1500px] px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-[#8a7565]">
          <Link href="/" className="hover:text-[#D96C2D]">Ballina</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/auctions" className="hover:text-[#D96C2D]">Ankandet</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1">{auc.product?.title}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="relative overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-[#F7D8B5]/25 shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&auto=format&fit=crop&q=80"}
                alt={auc.product?.title}
                className="aspect-[1.18] w-full object-cover"
              />
              <span className="absolute left-5 top-5 rounded-full bg-[#D96C2D] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                {isEnded ? "Ankand i mbyllur" : "Ankand aktiv"}
              </span>
              <button className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#f0d9c4] bg-white/92 text-[#6f5b4c] backdrop-blur" aria-label="Ruaj ankandin">
                <Heart className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 rounded-[24px] border border-[#f0d9c4] bg-white/84 p-5 md:grid-cols-4">
              {[
                [ShieldCheck, "E kontrolluar", "Produkti është testuar dhe verifikuar."],
                [Truck, "Transport i sigurt", "Dërgesë e ndjekur dhe e shpejtë."],
                [RotateCcw, "14 ditë kthim", "Zgjidhje nëse ka problem."],
                [AlertTriangle, "Ofertim i pastër", "Oferta të dyshimta monitorohen."],
              ].map(([Icon, title, copy]) => (
                <div key={String(title)} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#352B24]">{title as string}</p>
                    <p className="text-xs leading-5 text-[#8a7565]">{copy as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-white shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
              <div className="border-b border-[#f0d9c4] bg-[#fffdf8] p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">
                    {auc.category?.name || "Kategori"}
                  </span>
                  <span className="rounded-full bg-[#F7D8B5] px-3 py-1 text-xs font-black uppercase text-[#D96C2D]">
                    {isEnded ? "Mbyllur" : "Aktiv"}
                  </span>
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] text-[#352B24]">
                  {auc.product?.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 border-b border-[#f0d9c4]">
                <div className="p-6">
                  <div className="text-xs font-bold uppercase text-[#8a7565]">Çmimi fillestar</div>
                  <div className="mt-2 text-lg font-black text-[#5e4c3f]">{formatEurFromAll(auc.starting_price)}</div>
                </div>
                <div className="border-l border-[#f0d9c4] p-6 text-right">
                  <div className="text-xs font-bold uppercase text-[#8a7565]">Oferta aktive</div>
                  <div className="mt-2 text-3xl font-black text-[#D96C2D]">{formatEurFromAll(auc.current_price)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-[#f0d9c4] bg-[#352B24] text-white">
                <div className="p-5">
                  <div className="text-xs font-bold uppercase text-[#F7D8B5]">Koha e mbetur</div>
                  <div className="mt-2 text-lg font-black">{formatTime(auc.end_time)}</div>
                </div>
                <div className="border-l border-white/10 p-5 text-right">
                  <div className="text-xs font-bold uppercase text-[#F7D8B5]">Oferta</div>
                  <div className="mt-2 text-lg font-black">{activeBids.length} bide</div>
                </div>
              </div>

              <div className="bg-[#352B24] p-5">
                {isEnded ? (
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left text-white">
                    {isWinner ? (
                      <>
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F7D8B5]">
                          <Award className="h-4 w-4" />
                          Urime, ju fituat
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#FFF8F1]">
                          Ju jeni ofertuesi më i lartë. Administratori do të vazhdojë me procesimin e porosisë.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-6 text-[#FFF8F1]">
                        Ankandi ka përfunduar. Produkti iu dha ofertuesit me ofertën më të lartë.
                      </p>
                    )}
                  </div>
                ) : (
                  <BiddingForm
                    auctionId={auc.id}
                    currentPrice={auc.current_price}
                    minIncrement={auc.min_increment}
                    isAdmin={isOwnerAdmin}
                    isLoggedIn={isLoggedIn}
                    isProfileComplete={isProfileComplete}
                    isAccountVerified={isAccountVerified}
                    isBlocked={isOwnerAdmin ? false : user?.is_blocked || false}
                    hasBids={activeBids.length > 0}
                    startingPrice={auc.starting_price}
                  />
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1fr_420px]">
          <div className="rounded-[24px] border border-[#f0d9c4] bg-white/84 p-6">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Përshkrimi</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#6f5b4c]">{auc.product?.description}</p>
            {auc.product?.testing_notes && (
              <div className="mt-6 rounded-2xl border border-[#F7D8B5] bg-[#FFF8F1] p-5">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#D96C2D]">
                  <ShieldCheck className="h-5 w-5" />
                  Raporti i kontrollit teknik
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5e4c3f]">&ldquo;{auc.product.testing_notes}&rdquo;</p>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#f0d9c4] bg-white/84 p-6">
            <h2 className="text-xl font-black tracking-[-0.02em] text-[#352B24]">Historiku i ofertave</h2>
            {bids.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-[#FFF8F1] p-8 text-center text-sm text-[#8a7565]">
                Nuk ka ende oferta. Bëhu i pari që oferton.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-[#f0d9c4]">
                {bids.map((bid, index) => {
                  const isLeader = bid.status === "active" && index === 0;
                  return (
                    <div key={bid.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#352B24]">{maskName(bid.user?.full_name)}</span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7D8B5] px-2 py-1 text-[10px] font-black uppercase text-[#D96C2D]">
                              <UserCheck className="h-3 w-3" />
                              Në krye
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-[#8a7565]">
                          {new Date(bid.created_at).toLocaleString("sq-AL")}
                        </div>
                      </div>
                      <div className="text-lg font-black text-[#D96C2D]">{formatEurFromAll(bid.amount)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {relatedAuctions.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#352B24]">Ankande të tjera</h2>
              <Link href="/auctions" className="text-sm font-black text-[#D96C2D]">Shiko të gjitha</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedAuctions.map((auction) => (
                <BrandAuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
