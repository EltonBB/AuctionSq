import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionById, getAuctions, getBidsForAuction, getCurrentUserProfile } from "@/lib/db";
import { formatEurFromAll } from "@/lib/currency";
import BiddingForm from "@/app/components/BiddingForm";
import CountdownText from "@/app/components/CountdownText";
import PollingRefresh from "@/app/components/PollingRefresh";
import { BrandAuctionCard } from "@/app/components/BrandUi";
import SafeImage from "@/app/components/SafeImage";
import { AlertTriangle, Award, ChevronRight, Heart, RotateCcw, ShieldCheck, Truck, UserCheck } from "lucide-react";

export const revalidate = 0;

interface AuctionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function maskName(name: string) {
  if (!name) return "Perdorues";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0].slice(0, 2)}*** ${parts[1].slice(0, 1)}.`;
  return `${name.slice(0, 3)}***`;
}

const trustItems = [
  [ShieldCheck, "E kontrolluar", "Produkti eshte testuar dhe verifikuar."],
  [Truck, "Transport i sigurt", "Dergese e ndjekur dhe e shpejte."],
  [RotateCcw, "14 dite kthim", "Zgjidhje nese ka problem."],
  [AlertTriangle, "Ofertim i paster", "Oferta te dyshimta monitorohen."],
] as const;

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { id: auctionId } = await params;
  const auc = await getAuctionById(auctionId);

  if (!auc || auc.product?.status !== "active") notFound();

  const bids = await getBidsForAuction(auctionId);
  const activeBids = bids.filter((bid) => bid.status === "active");
  const leaderBidId = activeBids[0]?.id;
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
    .filter((auction) => auction.id !== auctionId && auction.status === "active" && auction.product?.status === "active")
    .slice(0, 4);

  return (
    <div>
      <PollingRefresh intervalMs={10000} />
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:py-8">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#8a7565] sm:mb-6">
          <Link href="/" className="hover:text-[#D96C2D]">Ballina</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/auctions" className="hover:text-[#D96C2D]">Ankandet</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1">{auc.product?.title}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-[#F7D8B5]/25 shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
            <SafeImage
              src={auc.product?.images?.[0] || "/brand/home-feature-product.png"}
              alt={auc.product?.title}
              className="aspect-[1.08] w-full object-cover sm:aspect-[1.18]"
            />
            <span className="absolute left-5 top-5 rounded-full bg-[#D96C2D] px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
              {isEnded ? "Ankand i mbyllur" : "Ankand aktiv"}
            </span>
            <button className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#f0d9c4] bg-white/92 text-[#6f5b4c] backdrop-blur" aria-label="Ruaj ankandin">
              <Heart className="h-6 w-6" />
            </button>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-white shadow-[0_22px_60px_rgba(53,43,36,0.08)]">
              <div className="border-b border-[#f0d9c4] bg-[#fffdf8] p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#D96C2D]">
                    {auc.category?.name || "Kategori"}
                  </span>
                  <span className="rounded-full bg-[#F7D8B5] px-3 py-1 text-xs font-black uppercase text-[#D96C2D]">
                    {isEnded ? "Mbyllur" : "Aktiv"}
                  </span>
                </div>
                <h1 className="text-2xl font-black leading-tight text-[#352B24] sm:text-3xl">
                  {auc.product?.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 border-b border-[#f0d9c4]">
                <div className="p-4 sm:p-6">
                  <div className="text-xs font-bold uppercase text-[#8a7565]">Cmimi fillestar</div>
                  <div className="mt-2 text-lg font-black text-[#5e4c3f]">{formatEurFromAll(auc.starting_price)}</div>
                </div>
                <div className="border-l border-[#f0d9c4] p-4 text-right sm:p-6">
                  <div className="text-xs font-bold uppercase text-[#8a7565]">Oferta aktive</div>
                  <div className="mt-2 text-2xl font-black text-[#D96C2D] sm:text-3xl">{formatEurFromAll(auc.current_price)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-[#f0d9c4] bg-[#352B24] text-white">
                <div className="p-4 sm:p-5">
                  <div className="text-xs font-bold uppercase text-[#F7D8B5]">Koha e mbetur</div>
                  <div className="mt-2 text-lg font-black">
                    <CountdownText endTime={auc.end_time} showSeconds />
                  </div>
                </div>
                <div className="border-l border-white/10 p-4 text-right sm:p-5">
                  <div className="text-xs font-bold uppercase text-[#F7D8B5]">Oferta</div>
                  <div className="mt-2 text-lg font-black">{activeBids.length} bide</div>
                </div>
              </div>

              <div className="bg-[#352B24] p-4 sm:p-5">
                {isEnded ? (
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left text-white">
                    {isWinner ? (
                      <>
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F7D8B5]">
                          <Award className="h-4 w-4" />
                          Urime, ju fituat
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#FFF8F1]">
                          Ju jeni ofertuesi me i larte. Administratori do te vazhdoje me procesimin e porosise.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-6 text-[#FFF8F1]">
                        Ankandi ka perfunduar. Produkti iu dha ofertuesit me oferten me te larte.
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

        <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_420px] xl:gap-8">
          <div className="grid gap-5">
            <div className="rounded-[24px] border border-[#f0d9c4] bg-white/84 p-5 sm:p-6">
              <h2 className="text-2xl font-black text-[#352B24]">Pershkrimi</h2>
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

            <div className="grid gap-3 rounded-[24px] border border-[#f0d9c4] bg-white/84 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
              {trustItems.map(([Icon, title, copy]) => (
                <div key={title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#352B24]">{title}</p>
                    <p className="text-xs leading-5 text-[#8a7565]">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#f0d9c4] bg-white/84 p-5 sm:p-6">
            <h2 className="text-xl font-black text-[#352B24]">Historiku i ofertave</h2>
            {bids.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-[#FFF8F1] p-8 text-center text-sm text-[#8a7565]">
                Nuk ka ende oferta. Behu i pari qe oferton.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-[#f0d9c4]">
                {bids.map((bid) => {
                  const isLeader = bid.id === leaderBidId;
                  return (
                    <div key={bid.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#352B24]">{maskName(bid.user?.full_name)}</span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7D8B5] px-2 py-1 text-[10px] font-black uppercase text-[#D96C2D]">
                              <UserCheck className="h-3 w-3" />
                              Ne krye
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
              <h2 className="text-2xl font-black text-[#352B24]">Ankande te tjera</h2>
              <Link href="/auctions" className="text-sm font-black text-[#D96C2D]">Shiko te gjitha</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-4">
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
