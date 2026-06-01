import React from "react";
import { AuctionCreateForm } from "@/app/components/AdminForms";
import { cancelAuction, relistAuction } from "@/app/actions/admin";
import { ConfirmSubmitButton } from "@/app/components/AdminUi";
import { getAuctions, getOrders, getProducts } from "@/lib/db";
import { allToEur, formatEurFromAll } from "@/lib/currency";

export const revalidate = 0;

const QUICK_HOURS = [24, 48, 72];

export default async function AdminAuctionsPage() {
  const [auctions, products, orders] = await Promise.all([getAuctions(), getProducts(), getOrders()]);
  const activeOrScheduled = auctions.filter((auction) => auction.status === "active" || auction.status === "scheduled");
  const liveProductIds = new Set(activeOrScheduled.map((auction) => auction.product_id));
  const auctionableProducts = products.filter((product) => product.status === "active" && !liveProductIds.has(product.id));
  const previous = auctions.filter((auction) => ["ended", "cancelled", "relisted"].includes(auction.status));
  const ordersByAuctionId = new Map(orders.map((order) => [order.auction_id, order]));
  const soldAuctions = previous.filter((auction) => auction.status === "ended" && !!ordersByAuctionId.get(auction.id));
  const unsoldAuctions = previous.filter((auction) => auction.status === "ended" && !ordersByAuctionId.get(auction.id));
  const cancelledAuctions = previous.filter((auction) => auction.status === "cancelled");

  async function cancel(formData: FormData) {
    "use server";
    await cancelAuction(String(formData.get("auctionId") || ""));
  }

  async function relist(formData: FormData) {
    "use server";
    await relistAuction(
      String(formData.get("auctionId") || ""),
      Number(formData.get("durationHours") || "24"),
      Number(formData.get("startingPrice"))
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Ankandet</h1>
          <p className="mt-1 text-sm text-slate-500">Ankandet mbyllen automatikisht. Me oferta krijohet porosia e fituesit; pa oferta kalojne te &quot;Pa shitura&quot;.</p>
        </div>

        <h2 className="mb-3 text-sm font-black uppercase text-slate-500">Aktive dhe te programuara</h2>
        <div className="grid gap-3">
          {activeOrScheduled.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Nuk ka ankande aktive per momentin.</p>
          ) : (
            activeOrScheduled.map((auction) => (
              <article key={auction.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-black">{auction.product?.title}</p>
                    <p className="text-sm text-slate-500">{new Date(auction.start_time).toLocaleString()} - {new Date(auction.end_time).toLocaleString()}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-md bg-slate-100 px-2 py-1">{auction.status}</span>
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Oferta me e larte {formatEurFromAll(auction.current_price)}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-1">Hapi minimal {formatEurFromAll(auction.min_increment)}</span>
                    </div>
                  </div>
                  <form action={cancel}>
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <ConfirmSubmitButton
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50"
                      confirmMessage="Anulo kete ankand?"
                    >
                      Anulo ankandin
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-black uppercase text-slate-500">Te shitura (me fitues)</h2>
        <div className="grid gap-3">
          {soldAuctions.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Nuk ka ankande te shitura ende.</p>
          ) : (
            soldAuctions.map((auction) => {
              const order = ordersByAuctionId.get(auction.id);
              const canRelist = order?.status === "cancelled";
              return (
              <article key={auction.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-base font-black">{auction.product?.title}</p>
                    <p className="text-sm text-slate-500">Fituesi: {order?.full_name || "Perdorues"} ({order?.phone_number || "N/A"})</p>
                    <p className="text-sm text-slate-500">Cmimi final: {formatEurFromAll(order?.final_price || auction.current_price)}</p>
                    <p className="text-sm text-slate-500">Statusi i porosise: {String(order?.status || "").replaceAll("_", " ")}</p>
                  </div>
                  <form action={relist} className="grid gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-[120px_auto] sm:items-center">
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <input name="startingPrice" type="number" min="1" step="0.01" defaultValue={allToEur(auction.current_price).toFixed(2)} className="rounded-md border border-slate-200 px-2 py-2 text-xs" disabled={!canRelist} />
                    <div className="flex flex-wrap gap-2">
                      {QUICK_HOURS.map((hours) => (
                        <button key={hours} name="durationHours" value={hours} disabled={!canRelist} className="rounded-md bg-[#082047] px-3 py-2 text-xs font-black text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40">
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </form>
                </div>
                {!canRelist && (
                  <p className="mt-3 text-xs font-semibold text-amber-700">
                    Relist bllokohet derisa kjo porosi te anulohet.
                  </p>
                )}
              </article>
            )})
          )}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-black uppercase text-slate-500">Pa shitura (pa oferta)</h2>
        <div className="grid gap-3">
          {unsoldAuctions.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Nuk ka ankande te mbyllura pa oferte.</p>
          ) : (
            unsoldAuctions.map((auction) => (
              <article key={auction.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-base font-black">{auction.product?.title}</p>
                    <p className="text-sm text-slate-500">Nuk ka pasur asnje oferte aktive deri ne perfundim.</p>
                    <p className="text-sm text-slate-500">Cmimi fillestar: {formatEurFromAll(auction.starting_price)}</p>
                  </div>
                  <form action={relist} className="grid gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-[120px_auto] sm:items-center">
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <input name="startingPrice" type="number" min="1" step="0.01" defaultValue={allToEur(auction.starting_price).toFixed(2)} className="rounded-md border border-slate-200 px-2 py-2 text-xs" />
                    <div className="flex flex-wrap gap-2">
                      {QUICK_HOURS.map((hours) => (
                        <button key={hours} name="durationHours" value={hours} className="rounded-md bg-[#082047] px-3 py-2 text-xs font-black text-white hover:bg-blue-900">
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-black uppercase text-slate-500">Te anuluara</h2>
        <div className="grid gap-3">
          {cancelledAuctions.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Nuk ka ankande te anuluara.</p>
          ) : (
            cancelledAuctions.map((auction) => (
              <article key={auction.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-base font-black">{auction.product?.title}</p>
                <p className="text-sm text-slate-500">Ankandi u anulua nga administratori.</p>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="h-fit xl:sticky xl:top-6">
        <AuctionCreateForm products={auctionableProducts} />
      </aside>
    </div>
  );
}
