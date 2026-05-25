"use client";

import React, { useActionState } from "react";
import { createAuction, createProduct } from "@/app/actions/admin";
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

const input = "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500";

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
      <textarea name="imageUrls" rows={3} placeholder="URL imazhesh, ndare me presje" className={input} />
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-900 disabled:opacity-60">
        <PackagePlus className="h-4 w-4" />
        {isPending ? "Duke shtuar..." : "Shto produktin"}
      </button>
    </form>
  );
}

export function AuctionCreateForm({ products }: { products: Product[] }) {
  const [state, formAction, isPending] = useActionState(createAuction, null);
  const now = new Date();
  const start = new Date(now.getTime() + 30 * 60_000).toISOString().slice(0, 16);
  const end = new Date(now.getTime() + 48 * 60 * 60_000).toISOString().slice(0, 16);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-950">Programo ankand</h2>
        <p className="mt-1 text-sm text-slate-500">Lidhu me nje produkt, cakto cmimin dhe afatin.</p>
      </div>
      <Message state={state} />
      <select name="productId" className={input} defaultValue={products[0]?.id || ""}>
        {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
      </select>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="startingPrice" required type="number" min="1" placeholder="Cmimi fillestar" className={input} />
        <input name="minIncrement" required type="number" min="1" defaultValue="500" placeholder="Hapi minimal" className={input} />
        <input name="startTime" required type="datetime-local" defaultValue={start} className={input} />
        <input name="endTime" required type="datetime-local" defaultValue={end} className={input} />
      </div>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-blue-900 disabled:opacity-60">
        <Gavel className="h-4 w-4" />
        {isPending ? "Duke krijuar..." : "Krijo ankandin"}
      </button>
    </form>
  );
}
