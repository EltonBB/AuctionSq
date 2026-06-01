"use client";

import React, { useActionState } from "react";
import { createAuction, createProduct, updateProduct } from "@/app/actions/admin";
import type { Category, Product } from "@/lib/db";
import { AlertCircle, CheckCircle2, Gavel, PackagePlus } from "lucide-react";

function Message({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs ${state?.success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
      <div className="flex gap-2">
        {state?.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <span>{state?.message || state?.error}</span>
      </div>
    </div>
  );
}

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500";
const fieldLabel = "grid gap-2 text-xs font-bold text-slate-600";

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, null);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-950">Shto produkt</h2>
        <p className="mt-1 text-sm text-slate-500">Krijo inventar te kontrolluar perpara se ta kthesh ne ankand.</p>
      </div>
      <Message state={state} />
      <input name="title" required placeholder="Titulli i produktit" className={input} />
      <select name="categoryId" className={input} defaultValue={categories[0]?.id || ""}>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select name="condition" className={input} defaultValue="like_new">
        <option value="new">I ri</option>
        <option value="like_new">Si i ri</option>
        <option value="used_good">I perdorur, gjendje e mire</option>
        <option value="used_fair">I perdorur, gjendje e pranueshme</option>
      </select>
      <textarea name="description" rows={4} placeholder="Pershkrim i qarte per bleresin" className={input} />
      <textarea name="testingNotes" rows={3} placeholder="Shenime testimi, defekte, garanci, kontroll teknik" className={input} />
      <label className="grid gap-1.5 text-xs font-bold text-slate-500">
        Foto produkti (max 5MB per foto)
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          required
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700"
        />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-900 disabled:opacity-60">
        <PackagePlus className="h-4 w-4" />
        {isPending ? "Duke shtuar..." : "Shto produktin"}
      </button>
    </form>
  );
}

export function AuctionCreateForm({ products }: { products: Product[] }) {
  const [state, formAction, isPending] = useActionState(createAuction, null);
  const hasProducts = products.length > 0;

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-950">Programo ankand</h2>
        <p className="mt-1 text-sm text-slate-500">Lidhu me nje produkt, cakto oferten minimale dhe kohezgjatjen ne ore. Cmimi rritet vetem nga ofertat e klienteve.</p>
      </div>
      <Message state={state} />
      <select name="productId" className={input} defaultValue={products[0]?.id || ""} disabled={!hasProducts}>
        {hasProducts ? (
          products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)
        ) : (
          <option value="">Nuk ka produkte te lira per ankand</option>
        )}
      </select>
      <div className="grid gap-4">
        <label className={fieldLabel}>
          Oferta minimale fillestare (EUR)
          <input name="startingPrice" required type="number" min="1" placeholder="p.sh 50" className={input} />
        </label>
        <label className={fieldLabel}>
          Hapi minimal i ofertes (EUR)
          <input name="minIncrement" required type="number" min="1" defaultValue="1" placeholder="p.sh 1" className={input} />
        </label>
        <label className={fieldLabel}>
          Kohezgjatja e ankandit (ore)
          <input name="durationHours" required type="number" min="1" max="168" defaultValue="24" placeholder="24" className={input} />
        </label>
      </div>
      <button disabled={isPending || !hasProducts} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-900 disabled:opacity-60">
        <Gavel className="h-4 w-4" />
        {isPending ? "Duke krijuar..." : "Krijo ankandin"}
      </button>
    </form>
  );
}

export function ProductUpdateForm({
  products,
  categories,
  defaultProductId,
}: {
  products: Product[];
  categories: Category[];
  defaultProductId?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const productId = String(formData.get("productId") || "");
      return updateProduct(productId, formData);
    },
    null
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-950">Përditëso produkt</h2>
        <p className="mt-1 text-sm text-slate-500">Edito të dhënat e produktit ose ndrysho statusin.</p>
      </div>
      <Message state={state} />
      <select name="productId" className={input} defaultValue={defaultProductId || products[0]?.id || ""}>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title}
          </option>
        ))}
      </select>
      <input name="title" required placeholder="Titulli i ri i produktit" className={input} />
      <select name="categoryId" className={input} defaultValue={categories[0]?.id || ""}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select name="condition" className={input} defaultValue="like_new">
        <option value="new">I ri</option>
        <option value="like_new">Si i ri</option>
        <option value="used_good">I perdorur, gjendje e mire</option>
        <option value="used_fair">I perdorur, gjendje e pranueshme</option>
      </select>
      <select name="status" className={input} defaultValue="active">
        <option value="active">Aktiv</option>
        <option value="inactive">Joaktiv</option>
      </select>
      <textarea name="description" rows={3} placeholder="Pershkrim i perditesuar" className={input} />
      <textarea name="testingNotes" rows={3} placeholder="Shenime testimi" className={input} />
      <label className="grid gap-1.5 text-xs font-bold text-slate-500">
        Foto të reja (opsionale)
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
        <input type="checkbox" name="keepExistingImages" value="true" defaultChecked />
        Mbaj fotot ekzistuese
      </label>
      <button
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-900 disabled:opacity-60"
      >
        {isPending ? "Duke ruajtur..." : "Ruaj përditësimin"}
      </button>
    </form>
  );
}
