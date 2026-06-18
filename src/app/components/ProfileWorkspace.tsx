"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Gavel, MapPin, TrendingDown, Trophy, X } from "lucide-react";
import type { Auction, Bid, Order, Product, Profile } from "@/lib/db";
import { updatePassword, updateProfile } from "@/app/actions/auth";
import { formatEurFromAll } from "@/lib/currency";
import SafeImage from "@/app/components/SafeImage";

function Notice({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs ${state?.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
      <div className="flex items-start gap-2">
        {state?.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>{state?.message || state?.error}</span>
      </div>
    </div>
  );
}

type WorkspaceProps = {
  user: Profile;
  orders: (Order & { auction: Auction & { product: Product } })[];
  bids: (Bid & { auction: Auction & { product: Product } })[];
};

const orderStatusLabels: Record<string, string> = {
  pending_confirmation: "Ne pritje te konfirmimit",
  confirmed: "Konfirmuar",
  processing: "Ne pergatitje",
  out_for_delivery: "Ne dergese",
  delivered: "Dorezuar",
  cancelled: "Anuluar",
};

export default function ProfileWorkspace({ user, orders, bids }: WorkspaceProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, null);
  const [addressState, addressAction, addressPending] = useActionState(updateProfile, null);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const [firstName, lastName] = useMemo(() => {
    const parts = (user.full_name || "").split(" ").filter(Boolean);
    if (parts.length === 0) return ["", ""];
    if (parts.length === 1) return [parts[0], ""];
    return [parts[0], parts.slice(1).join(" ")];
  }, [user.full_name]);

  const isOwnerAdmin = !!user.is_admin;
  const bidSummaries = useMemo(() => {
    const byAuction = new Map<string, Bid & { auction: Auction & { product: Product } }>();
    for (const bid of bids) {
      const current = byAuction.get(bid.auction_id);
      if (!current || bid.amount > current.amount || (bid.amount === current.amount && bid.created_at > current.created_at)) {
        byAuction.set(bid.auction_id, bid);
      }
    }
    return Array.from(byAuction.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bids]);
  const canBid =
    isOwnerAdmin ||
    !!user.full_name &&
    !!user.phone_number &&
    !!user.city &&
    !!user.address &&
    !!user.email_verified;

  return (
    <div className="min-h-screen brand-surface">
      <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-10">
        <div className="relative overflow-hidden rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D96C2D] via-[#E6A52F] to-[#D96C2D]" />
          <div className="grid gap-2">
          <h1 className="text-3xl font-black text-[#352B24]">Profili</h1>
            <p className="text-sm text-[#6f5b4c]">
              {isOwnerAdmin
                ? "Llogari administratori. Seksionet e ofertimit per klientet nuk aplikohen."
                : "Keto informacione perdoren per verifikim dhe dergesa."}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-7">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#D96C2D]">Profili</h2>
              <p className="mt-1 text-xs text-[#8a7565]">Te dhenat kryesore te llogarise suaj.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F7D8B5] bg-[#F7D8B5] text-sm font-black text-[#D96C2D]">
                  {(user.full_name || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#352B24]">{user.full_name || "Perdorues"}</p>
                  <p className="truncate text-xs text-[#8a7565]">{user.email || "N/A"}</p>
                </div>
              </div>
            </div>

            <form action={profileAction} className="grid gap-4 rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1]/80 p-4 md:p-5">
              <Notice state={profileState} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-[#6f5b4c]">
                  Emri
                  <input
                    name="firstName"
                    defaultValue={firstName}
                    className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-3 py-2.5 text-sm text-[#352B24]"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#6f5b4c]">
                  Mbiemri
                  <input
                    name="lastName"
                    defaultValue={lastName}
                    className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-3 py-2.5 text-sm text-[#352B24]"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-semibold text-[#6f5b4c]">
                Email
                <input value={user.email || ""} readOnly className="rounded-xl border border-[#ead2bc] bg-white px-3 py-2.5 text-sm text-[#6f5b4c]" />
              </label>

              <input type="hidden" name="phoneNumber" value={user.phone_number || ""} />
              <input type="hidden" name="country" value={user.country || "Albania"} />
              <input type="hidden" name="city" value={user.city || ""} />
              <input type="hidden" name="address" value={user.address || ""} />
              <input type="hidden" name="postalCode" value={user.postal_code || ""} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profilePending}
                  className="rounded-xl bg-[#D96C2D] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520] disabled:opacity-60"
                >
                  {profilePending ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-7">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#D96C2D]">Ndrysho fjalekalimin</h2>
              <p className="mt-1 text-xs text-[#8a7565]">Siguroni llogarine tuaj me nje fjalekalim te ri.</p>
            </div>
            <form action={passwordAction} className="grid gap-4 rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1]/80 p-4 md:p-5">
              <Notice state={passwordState} />
              <label className="grid gap-1.5 text-xs font-semibold text-[#6f5b4c]">
                Fjalekalimi i ri
                <input name="password" type="password" required minLength={8} className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-3 py-2.5 text-sm text-[#352B24]" />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#6f5b4c]">
                Konfirmo fjalekalimin
                <input name="confirmPassword" type="password" required minLength={8} className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-3 py-2.5 text-sm text-[#352B24]" />
              </label>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordPending}
                  className="rounded-xl bg-[#D96C2D] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520] disabled:opacity-60"
                >
                  {passwordPending ? "Duke ruajtur..." : "Ndrysho fjalekalimin"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {!isOwnerAdmin && (
          <div id="addresses" className="mt-6 rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-7">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#D96C2D]">Adresa e dergeses</h2>
                <p className="mt-1 text-xs text-[#8a7565]">Duhen te dhena te sakta para ofertimit.</p>
              </div>
              <div className="rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1]/80 p-4 md:p-5">
                <p className="text-sm text-[#6f5b4c]">
                  Statusi i ofertimit:{" "}
                  <span className={`font-black ${canBid ? "text-emerald-700" : "text-amber-700"}`}>
                    {canBid ? "i aktivizuar" : "jo i aktivizuar"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddressOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#D96C2D] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Menaxho adresat
                </button>
              </div>
            </div>
          </div>
        )}

        {!isOwnerAdmin && (
          <div className="mt-6 rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-7">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#D96C2D]">Ofertat e mia</h2>
                <p className="mt-1 text-xs text-[#8a7565]">Shiko nese je ne krye apo je tejkaluar.</p>
              </div>
              <div className="grid gap-3">
                {bidSummaries.length === 0 ? (
                  <p className="rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1] p-4 text-sm text-[#8a7565]">
                    Nuk keni vendosur ende asnje oferte.
                  </p>
                ) : (
                  bidSummaries.map((bid) => {
                    const isWinning = bid.status === "active" && bid.amount >= bid.auction.current_price;
                    const isEnded = bid.auction.status === "ended";
                    const isWinner = isEnded && bid.auction.winner_id === user.id;
                    const label = isWinner ? "Fituar" : isWinning ? "Ne krye" : "Tejkaluar";
                    const Icon = isWinner || isWinning ? Trophy : TrendingDown;
                    return (
                      <Link
                        key={`${bid.auction_id}-${bid.id}`}
                        href={`/auctions/${bid.auction_id}`}
                        className="group rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1]/80 p-4 transition hover:-translate-y-0.5 hover:border-[#D96C2D]/55 hover:bg-white"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7D8B5]/45">
                              <SafeImage
                                src={bid.auction.product?.images?.[0] || "/brand/home-feature-product.png"}
                                alt=""
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#352B24]">{bid.auction.product?.title || "Produkt"}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                                <span className="rounded-full bg-white px-2.5 py-1 text-[#6f5b4c]">
                                  Oferta jote: {formatEurFromAll(bid.amount)}
                                </span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[#6f5b4c]">
                                  Aktuale: {formatEurFromAll(bid.auction.current_price)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase ${
                              isWinner || isWinning ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
                {bidSummaries.length > 0 && (
                  <Link href="/auctions" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D96C2D]/35 px-4 py-2 text-xs font-black uppercase text-[#D96C2D] transition hover:bg-[#D96C2D] hover:text-white">
                    <Gavel className="h-3.5 w-3.5" />
                    Vazhdo ofertimin
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {!isOwnerAdmin && (
          <div className="mt-6 rounded-[28px] border border-[#f0d9c4] bg-white/86 p-6 shadow-[0_16px_44px_rgba(53,43,36,0.06)] md:p-7">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#D96C2D]">Porosite e fituara</h2>
                <p className="mt-1 text-xs text-[#8a7565]">Statusi i produkteve qe keni fituar ne ankand.</p>
              </div>
              <div className="grid gap-3">
                {orders.length === 0 ? (
                  <p className="rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1] p-4 text-sm text-[#8a7565]">
                    Nuk keni ende produkte te fituara.
                  </p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-[#f0d9c4] bg-[#FFF8F1]/80 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#352B24]">
                            {order.auction?.product?.title || "Produkt"}
                          </p>
                          <p className="mt-1 text-xs text-[#8a7565]">
                            {formatEurFromAll(order.final_price)} - {order.city}, {order.address}
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-[#F7D8B5] px-3 py-1 text-xs font-black uppercase text-[#D96C2D]">
                          {orderStatusLabels[order.status] || order.status}
                        </span>
                      </div>
                      {order.status === "pending_confirmation" && (
                        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                          Konfirmoni adresen e dergeses qe administratori te vazhdoje porosine.
                        </p>
                      )}
                      {order.status === "cancelled" && (
                        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                          Porosia u anulua. Produkti mund te rikthehet ne ankand nga administratori.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {!isOwnerAdmin && isAddressOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#352B24]/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[620px] rounded-[28px] border border-[#f0d9c4] bg-white p-6 shadow-2xl md:p-7">
            <div className="mb-5 h-1 w-28 rounded-full bg-gradient-to-r from-[#D96C2D] via-[#E6A52F] to-[#D96C2D]" />
            <div className="flex items-start justify-between">
              <div>
            <h3 className="text-3xl font-black leading-tight text-[#352B24]">Shto Adresen e Dergeses</h3>
                <p className="mt-1 text-sm text-[#6f5b4c]">Ruaj adresen per proces te shpejte ofertimi dhe porosie.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressOpen(false)}
                className="rounded-full border border-[#f0d9c4] p-2 text-[#6f5b4c] transition hover:bg-[#FFF8F1]"
                aria-label="Mbyll"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={addressAction} className="mt-6 grid gap-3.5">
              <Notice state={addressState} />
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Emri i plote *
                <input
                  name="fullName"
                  defaultValue={user.full_name || ""}
                  required
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Numri i telefonit *
                <input
                  name="phoneNumber"
                  defaultValue={user.phone_number || ""}
                  required
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Shteti *
                <select
                  name="country"
                  defaultValue={user.country || "Albania"}
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                >
                  <option value="Albania">Albania</option>
                  <option value="Kosovo">Kosovo</option>
                  <option value="North Macedonia">North Macedonia</option>
                  <option value="Montenegro">Montenegro</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Qyteti *
                <input
                  name="city"
                  defaultValue={user.city || ""}
                  required
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Rruga / Adresa *
                <input
                  name="address"
                  defaultValue={user.address || ""}
                  required
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-[#6f5b4c]">
                Kodi postar
                <input
                  name="postalCode"
                  defaultValue={user.postal_code || ""}
                  className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]"
                />
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressOpen(false)}
                  className="rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm font-bold text-[#6f5b4c] transition hover:bg-[#FFF8F1]"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  disabled={addressPending}
                  className="rounded-xl bg-[#D96C2D] px-4 py-3 text-sm font-black text-white transition hover:bg-[#bf5520] disabled:opacity-60"
                >
                  {addressPending ? "Duke ruajtur..." : "Ruaj & Vazhdoni"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

