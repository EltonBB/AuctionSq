import React from "react";
import { ProductCreateForm, ProductUpdateForm } from "@/app/components/AdminForms";
import { deleteProduct, setProductStatus } from "@/app/actions/admin";
import { ConfirmSubmitButton } from "@/app/components/AdminUi";
import { getCategories, getProducts } from "@/lib/db";

export const revalidate = 0;

const conditionLabel: Record<string, string> = {
  new: "I ri",
  like_new: "Si i ri",
  used_good: "I perdorur mire",
  used_fair: "I perdorur",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  async function setStatus(formData: FormData) {
    "use server";
    await setProductStatus(
      String(formData.get("productId") || ""),
      String(formData.get("status") || "active") as "active" | "inactive"
    );
  }

  async function quickAction(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    const action = String(formData.get("action") || "");
    if (!productId || !action) return;

    if (action === "deactivate") {
      await setProductStatus(productId, "inactive");
    }
    if (action === "activate") {
      await setProductStatus(productId, "active");
    }
    if (action === "delete") {
      await deleteProduct(productId);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Produktet</h1>
          <p className="mt-1 text-sm text-slate-500">Liste e paster me veprime te thjeshta per adminin.</p>
        </div>

        <form action={quickAction} className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
          <select name="productId" defaultValue={products[0]?.id || ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
          <select name="action" defaultValue="deactivate" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="deactivate">Caktivizo</option>
            <option value="activate">Aktivizo</option>
            <option value="delete">Fshij plotesisht</option>
          </select>
          <ConfirmSubmitButton
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082047] px-4 py-2 text-xs font-black uppercase text-white"
            confirmMessage="Je i sigurt per kete veprim mbi produktin?"
          >
            Ekzekuto
          </ConfirmSubmitButton>
        </form>

        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="flex min-w-0 gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images?.[0]} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-slate-900">{product.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description || "Pa pershkrim."}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        {categories.find((c) => c.id === product.category_id)?.name || "Pa kategori"}
                      </span>
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{conditionLabel[product.condition]}</span>
                      <span className={`rounded-md px-2 py-1 ${product.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {product.status === "active" ? "aktiv" : "joaktiv"}
                      </span>
                    </div>
                    {product.testing_notes ? <p className="mt-2 line-clamp-1 text-xs text-slate-500">Testim: {product.testing_notes}</p> : null}
                  </div>
                </div>

                <form action={setStatus} className="self-start">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="status" value={product.status === "active" ? "inactive" : "active"} />
                  <ConfirmSubmitButton
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                    confirmMessage={product.status === "active" ? "Caktivizo kete produkt?" : "Aktivizo kete produkt?"}
                  >
                    {product.status === "active" ? "Caktivizo" : "Aktivizo"}
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="grid h-fit gap-4 xl:sticky xl:top-6">
        <ProductCreateForm categories={categories} />
        <ProductUpdateForm products={products} categories={categories} />
      </aside>
    </div>
  );
}
