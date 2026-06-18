import React from "react";
import Link from "next/link";
import { ProductCreateForm } from "@/app/components/AdminForms";
import { cancelAuction, createAuction, deleteProduct, relistAuction, setProductStatus } from "@/app/actions/admin";
import { ConfirmSubmitButton } from "@/app/components/AdminUi";
import AutoRelistToggleForm from "@/app/components/AutoRelistToggleForm";
import SafeImage from "@/app/components/SafeImage";
import { getAuctions, getCategories, getOrders, getProducts } from "@/lib/db";
import { allToEur, formatEurFromAll } from "@/lib/currency";

export const revalidate = 0;

const QUICK_HOURS = [24, 48, 72];
const RELIST_LOCKED_ORDER_STATUSES = ["pending_confirmation", "confirmed", "processing", "out_for_delivery"];
const PRODUCT_FILTERS = [
  { key: "unlisted", label: "Te palistuara" },
  { key: "listed", label: "Te listuara" },
  { key: "processing", label: "Ne proces" },
] as const;
type ProductFilter = (typeof PRODUCT_FILTERS)[number]["key"];

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeFilter = PRODUCT_FILTERS.some((filter) => filter.key === resolvedParams?.filter)
    ? (resolvedParams?.filter as ProductFilter)
    : "unlisted";
  const [auctions, products, orders, categories] = await Promise.all([
    getAuctions(),
    getProducts(),
    getOrders(),
    getCategories(),
  ]);
  const activeOrScheduled = auctions.filter((auction) => auction.status === "active" || auction.status === "scheduled");
  const liveAuctionByProductId = new Map(activeOrScheduled.map((auction) => [auction.product_id, auction]));
  const auctionsByProductId = new Map<string, typeof auctions>();
  for (const auction of auctions) {
    const productAuctions = auctionsByProductId.get(auction.product_id) || [];
    productAuctions.push(auction);
    auctionsByProductId.set(auction.product_id, productAuctions);
  }

  const productRows = products.map((product) => {
    const productAuctions = [...(auctionsByProductId.get(product.id) || [])].sort(
      (a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
    );
    const liveAuction = liveAuctionByProductId.get(product.id);
    const productAuctionIds = new Set(productAuctions.map((auction) => auction.id));
    const productOrders = orders.filter((order) => productAuctionIds.has(order.auction_id));
    const processingOrders = productOrders.filter((order) => !["delivered", "cancelled"].includes(order.status));
    const soldCount = productOrders.filter((order) => order.status === "delivered").length;
    const cancelledCount = productOrders.filter((order) => order.status === "cancelled").length;
    const lastAuction = productAuctions.find((auction) => ["ended", "cancelled", "relisted"].includes(auction.status));
    const lastAuctionOrder = lastAuction ? productOrders.find((order) => order.auction_id === lastAuction.id) : null;

    return {
      product,
      liveAuction,
      lastAuction,
      lastAuctionOrder,
      processingOrders,
      soldCount,
      cancelledCount,
      isListed: !!liveAuction,
      isProcessing: processingOrders.length > 0,
    };
  });

  const filteredRows = productRows.filter((row) => {
    if (activeFilter === "listed") return row.isListed;
    if (activeFilter === "processing") return row.isProcessing;
    return !row.isListed && !row.isProcessing;
  });

  const counts: Record<ProductFilter, number> = {
    unlisted: productRows.filter((row) => !row.isListed && !row.isProcessing).length,
    listed: productRows.filter((row) => row.isListed).length,
    processing: productRows.filter((row) => row.isProcessing).length,
  };

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

  async function createProductAuction(formData: FormData) {
    "use server";
    await createAuction(null, formData);
  }

  async function setStatus(formData: FormData) {
    "use server";
    await setProductStatus(
      String(formData.get("productId") || ""),
      String(formData.get("status") || "active") as "active" | "inactive"
    );
  }

  async function removeProduct(formData: FormData) {
    "use server";
    await deleteProduct(String(formData.get("productId") || ""));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Produktet dhe Ankandet</h1>
          <p className="mt-1 text-sm text-[#8a7565]">
            Shto produktin ne te djathte, pastaj listo produktet aktive ne ankand direkt nga kjo faqe.
          </p>
        </div>

        <div className="mb-5 grid gap-2 sm:grid-cols-3">
          {PRODUCT_FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={`/admin/auctions?filter=${filter.key}`}
              className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                activeFilter === filter.key
                  ? "border-[#D96C2D] bg-[#D96C2D] text-white"
                  : "border-[#f0d9c4] bg-[#FFF8F1] text-[#6f5b4c] hover:text-[#D96C2D]"
              }`}
            >
              {filter.label}
              <span className="ml-2 rounded-md bg-white/70 px-2 py-0.5 text-xs text-[#352B24]">{counts[filter.key]}</span>
            </Link>
          ))}
        </div>

        <div className="grid gap-3">
          {filteredRows.length === 0 ? (
            <p className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-4 text-sm text-[#8a7565]">
              Nuk ka produkte ne kete filter.
            </p>
          ) : (
            filteredRows.map(({ product, liveAuction, lastAuction, lastAuctionOrder, processingOrders, soldCount, cancelledCount }) => {
              const categoryName = categories.find((category) => category.id === product.category_id)?.name || "Pa kategori";
              const relistLockedByOrder = !!lastAuctionOrder && RELIST_LOCKED_ORDER_STATUSES.includes(lastAuctionOrder.status);
              const canRelist = !!lastAuction && !liveAuction && product.status === "active" && processingOrders.length === 0 && !relistLockedByOrder;
              const relistBlockReason =
                liveAuction
                  ? null
                  : product.status !== "active"
                    ? "Aktivizo produktin per ta listuar ose rilistuar."
                    : processingOrders.length > 0
                      ? "Rilistimi hapet pasi porosia ne proces te mbyllet ose anulohet."
                      : relistLockedByOrder
                        ? "Ky produkt ka porosi te fituar. Rilistimi hapet vetem nese porosia anulohet."
                        : null;
              return (
                <article key={product.id} className="rounded-xl border border-[#f0d9c4] bg-white/70 p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="flex min-w-0 gap-4">
                      <SafeImage
                        src={product.images?.[0]}
                        alt={product.title}
                        className="h-20 w-20 shrink-0 rounded-xl bg-[#FFF8F1] object-cover"
                      />
                      <div className="min-w-0">
                        <h2 className="text-base font-black text-[#352B24]">{product.title}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-[#6f5b4c]">{product.description || "Pa pershkrim."}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-md bg-[#FFF8F1] px-2 py-1">{categoryName}</span>
                          {liveAuction ? (
                            <span className="rounded-md bg-[#FFF8F1] px-2 py-1 text-[#D96C2D]">
                              I listuar: {formatEurFromAll(liveAuction.current_price)}
                            </span>
                          ) : null}
                          {processingOrders.length > 0 ? (
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{processingOrders.length} ne proces</span>
                          ) : null}
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">shitur {soldCount}</span>
                          <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">anuluar {cancelledCount}</span>
                        </div>
                        {lastAuction && !liveAuction ? (
                          <p className="mt-2 text-xs text-[#8a7565]">
                            Ankandi i fundit: {lastAuction.status} - {formatEurFromAll(lastAuction.current_price)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border border-[#f0d9c4] bg-[#fffaf5] p-3">
                      {liveAuction ? (
                        <>
                          <AutoRelistToggleForm auctionId={liveAuction.id} enabled={!!liveAuction.auto_relist} />
                          <form action={cancel}>
                            <input type="hidden" name="auctionId" value={liveAuction.id} />
                            <ConfirmSubmitButton
                              className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50"
                              confirmMessage="Anulo kete ankand?"
                            >
                              Anulo ankandin
                            </ConfirmSubmitButton>
                          </form>
                        </>
                      ) : product.status === "active" && processingOrders.length === 0 && !lastAuction ? (
                        <form action={createProductAuction} className="grid gap-2">
                          <input type="hidden" name="productId" value={product.id} />
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                            <input name="startingPrice" type="number" min="1" step="0.01" placeholder="Oferta minimale EUR" className="rounded-lg border border-[#f0d9c4] bg-white px-3 py-2 text-xs" />
                            <input name="minIncrement" type="number" min="1" step="0.01" defaultValue="1" className="rounded-lg border border-[#f0d9c4] bg-white px-3 py-2 text-xs" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {QUICK_HOURS.map((hours) => (
                              <button key={hours} name="durationHours" value={hours} className="rounded-lg bg-[#D96C2D] px-3 py-2 text-xs font-black text-white hover:bg-[#bf5520]">
                                {hours}h
                              </button>
                            ))}
                            <label className="ml-auto flex items-center gap-2 rounded-lg border border-[#f0d9c4] bg-white px-3 py-2 text-xs font-bold text-[#6f5b4c]">
                              <input type="checkbox" name="autoRelist" value="true" className="h-4 w-4 accent-[#D96C2D]" />
                              Auto 24h
                            </label>
                          </div>
                        </form>
                      ) : null}
                      {canRelist ? (
                        <form action={relist} className="grid gap-2">
                          <input type="hidden" name="auctionId" value={lastAuction.id} />
                          <input name="startingPrice" type="number" min="1" step="0.01" defaultValue={allToEur(lastAuction.current_price || lastAuction.starting_price).toFixed(2)} className="rounded-lg border border-[#f0d9c4] bg-white px-3 py-2 text-xs" />
                          <div className="flex flex-wrap gap-2">
                            {QUICK_HOURS.map((hours) => (
                              <button key={hours} name="durationHours" value={hours} className="rounded-lg border border-[#D96C2D]/35 bg-white px-3 py-2 text-xs font-black text-[#D96C2D] hover:bg-[#D96C2D] hover:text-white">
                                Relist {hours}h
                              </button>
                            ))}
                          </div>
                        </form>
                      ) : null}
                      {relistBlockReason ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                          {relistBlockReason}
                        </p>
                      ) : null}
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <form action={setStatus}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="status" value={product.status === "active" ? "inactive" : "active"} />
                          <ConfirmSubmitButton
                            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-[#5e4c3f] hover:bg-[#FFF8F1]"
                            confirmMessage={product.status === "active" ? "Caktivizo kete produkt?" : "Aktivizo kete produkt?"}
                          >
                            {product.status === "active" ? "Caktivizo" : "Aktivizo"}
                          </ConfirmSubmitButton>
                        </form>
                        <form action={removeProduct}>
                          <input type="hidden" name="productId" value={product.id} />
                          <ConfirmSubmitButton
                            className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50"
                            confirmMessage="Fshij kete produkt dhe te gjitha ankandet, ofertat dhe porosite e lidhura me te? Ky veprim nuk mund te kthehet mbrapa."
                          >
                            Fshij
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <aside className="h-fit xl:sticky xl:top-6">
        <ProductCreateForm categories={categories} />
      </aside>
    </div>
  );
}


