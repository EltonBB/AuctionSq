import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionById, getBidsForAuction, getSimulatedUser, getAuctions } from "@/lib/db";
import CountdownTimer from "@/app/components/CountdownTimer";
import BiddingForm from "@/app/components/BiddingForm";
import { ShieldCheck, Truck, RotateCcw, AlertTriangle, UserCheck, ChevronRight } from "lucide-react";

export const revalidate = 0;

interface AuctionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const resolvedParams = await params;
  const auctionId = resolvedParams.id;

  const auc = await getAuctionById(auctionId);
  if (!auc) {
    notFound();
  }

  const bids = await getBidsForAuction(auctionId);
  const activeBids = bids.filter(b => b.status === "active");
  const hasBids = activeBids.length > 0;

  // Retrieve current user
  const user = await getSimulatedUser();
  const isLoggedIn = user && user.id !== "usr-guest";
  
  // Verify profile completion
  const isProfileComplete = 
    isLoggedIn && 
    !!user.full_name && 
    !!user.phone_number && 
    !!user.city && 
    !!user.address;

  // Fetch more active auctions
  const allAuctions = await getAuctions();
  const relatedAuctions = allAuctions
    .filter((a) => a.id !== auctionId && a.status === "active")
    .slice(0, 3);

  // Condition translate map
  const conditionLabels: Record<string, string> = {
    new: "E Re (Paketuar)",
    like_new: "Si e Re (Kuti/Aksesorë)",
    used_good: "E Përdorur (Në Gjendje të Mirë)",
    used_fair: "E Përdorur (Shenja Estetike)"
  };

  // Helper to mask names for privacy
  const maskName = (name: string) => {
    if (!name) return "Përdorues";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts[1];
      return `${first.substring(0, 2)}*** ${last.substring(0, 1)}.`;
    }
    return `${name.substring(0, 3)}***`;
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-12">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/auctions" className="hover:text-blue-400 transition-colors">Ankandet</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400 line-clamp-1">{auc.product?.title}</span>
      </div>

      {/* Main detail split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Images & Description (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Main Gallery Container */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] w-full rounded-2xl bg-slate-900 border border-slate-850 overflow-hidden relative shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                alt={auc.product?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider backdrop-blur-sm shadow">
                  {conditionLabels[auc.product?.condition] || auc.product?.condition}
                </span>
              </div>
            </div>

            {/* Thumbnail previews if multiple exist */}
            {auc.product?.images && auc.product.images.length > 1 && (
              <div className="flex gap-3">
                {auc.product.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-850 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description & Technical notes tab box */}
          <div className="flex flex-col gap-6 bg-slate-900/10 border border-slate-900/60 p-6 sm:p-8 rounded-2xl">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Përshkrimi i Produktit</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line text-left">
                {auc.product?.description}
              </p>
            </div>

            {/* Testing Notes (Admin controlled) */}
            {auc.product?.testing_notes && (
              <div className="border-t border-slate-900 pt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
                  <span>Raporti i Kontrollit Teknik</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl text-left">
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    &ldquo;{auc.product?.testing_notes}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Price Status, Bidding, Bid History (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Price Info Card */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col gap-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500/10 border-b border-l border-blue-500/25 px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-blue-400 text-3xs font-extrabold uppercase tracking-widest">Ankand Aktiv</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">{auc.category?.name || "Kategori"}</span>
              <h1 className="text-2xl font-black text-white leading-tight">
                {auc.product?.title}
              </h1>
            </div>

            {/* Price stats split */}
            <div className="grid grid-cols-2 gap-4 border-y border-slate-900 py-4">
              <div>
                <span className="text-slate-500 text-2xs block uppercase">Çmimi Fillestar</span>
                <span className="text-slate-450 font-bold text-sm">{auc.starting_price.toLocaleString()} Llek</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-2xs block uppercase">Ofertë Aktive</span>
                <span className="text-2xl font-black text-emerald-400">{auc.current_price.toLocaleString()} Llek</span>
              </div>
            </div>

            {/* Time countdown and bid count */}
            <div className="flex justify-between items-center bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 text-2xs block uppercase mb-1">Mbyllja e Ankandit</span>
                <CountdownTimer endTime={auc.end_time} />
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-2xs block uppercase">Ofertat e Kryera</span>
                <span className="font-extrabold text-white text-base">{activeBids.length} bide</span>
              </div>
            </div>

            {/* Interactive bidding form client component */}
            <BiddingForm
              auctionId={auc.id}
              currentPrice={auc.current_price}
              minIncrement={auc.min_increment}
              isLoggedIn={isLoggedIn}
              isProfileComplete={isProfileComplete}
              isBlocked={user?.is_blocked || false}
              hasBids={hasBids}
              startingPrice={auc.starting_price}
            />

            {/* Delivery / Trust Badges */}
            <div className="flex flex-col gap-3 text-xs text-slate-500 border-t border-slate-900 pt-5">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-500/80" />
                <span>Dërgesë e Sigurtë me Postë (Pagesë në Dorëmbërritje)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-500/80" />
                <span>Produkt i Kontrolluar dhe i Certifikuar nga Ekipi Ynë</span>
              </div>
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                <span>Nuk lejohen oferta të rreme (Kufizohet llogaria)</span>
              </div>
            </div>
          </div>

          {/* Bid History Log (Extremely detailed) */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4 text-left">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Historia e Ofertave</h3>

            {bids.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nuk ka ende oferta. Bëhu i pari që oferton!
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {bids.map((bid, index) => {
                  const isActive = bid.status === "active";
                  const isLeader = isActive && index === 0;

                  return (
                    <div
                      key={bid.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isLeader
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : !isActive
                          ? "bg-red-500/5 border-red-950/20 text-slate-600 line-through"
                          : "bg-slate-950 border-slate-900 text-slate-400"
                      }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-300">
                            {maskName(bid.user?.full_name)}
                          </span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-3xs uppercase tracking-wider">
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>Në Krye</span>
                            </span>
                          )}
                          {!isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/20 text-red-400 font-extrabold text-3xs uppercase tracking-wider" title={bid.cancelled_reason}>
                              Anuluar
                            </span>
                          )}
                        </div>
                        <span className="text-3xs text-slate-500">
                          {new Date(bid.created_at).toLocaleString("sq-AL")}
                        </span>
                        {!isActive && bid.cancelled_reason && (
                          <span className="text-3xs text-red-400 italic block mt-0.5">
                            Arsyeja: {bid.cancelled_reason}
                          </span>
                        )}
                      </div>
                      <span className={`font-black text-sm ${isLeader ? "text-emerald-400" : !isActive ? "text-slate-600" : "text-slate-300"}`}>
                        {bid.amount.toLocaleString()} Llek
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related active auctions grid */}
      {relatedAuctions.length > 0 && (
        <div className="border-t border-slate-900 pt-12 flex flex-col gap-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Shfletoni Më Shumë</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Ankande të Tjera Aktive</h2>
            </div>
            <Link href="/auctions" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>Shko tek të gjitha</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedAuctions.map((auc) => (
              <div
                key={auc.id}
                className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 group hover:border-slate-800 transition-colors text-left"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auc.product?.images?.[0]}
                    alt={auc.product?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 right-3">
                    <CountdownTimer endTime={auc.end_time} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-blue-500 text-xs font-semibold uppercase">{auc.category?.name || "Kategori"}</span>
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors truncate">
                    {auc.product?.title}
                  </h3>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-auto">
                  <div>
                    <span className="text-slate-500 text-2xs block uppercase">Ofertë Aktive</span>
                    <span className="text-lg font-black text-emerald-400">{auc.current_price.toLocaleString()} Llek</span>
                  </div>
                  <Link
                    href={`/auctions/${auc.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs uppercase transition-colors"
                  >
                    Shiko
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
