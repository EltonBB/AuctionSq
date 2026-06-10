"use client";

import React, { useActionState, useState } from "react";
import { createAuction, createProduct, updateProduct } from "@/app/actions/admin";
import type { Category, Product } from "@/lib/db";
import { AlertCircle, CheckCircle2, Gavel, PackagePlus } from "lucide-react";

function Message({ state }: { state: any }) {
  if (!state?.error && !state?.success) return null;
  return (
    <div className={`rounded-xl border p-3 text-xs ${state?.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      <div className="flex gap-2">
        {state?.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <span>{state?.message || state?.error}</span>
      </div>
    </div>
  );
}

const input = "brand-focus w-full rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm text-[#352B24]";
const fieldLabel = "grid gap-2 text-xs font-bold text-[#6f5b4c]";
const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGE_COUNT = 8;
const MAX_PRODUCT_UPLOAD_BYTES = 24 * 1024 * 1024;

function validateImageFiles(files: File[]) {
  if (files.length > MAX_PRODUCT_IMAGE_COUNT) {
    return `Ngarko maksimumi ${MAX_PRODUCT_IMAGE_COUNT} foto per produkt.`;
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_PRODUCT_UPLOAD_BYTES) {
    return "Fotot jane shume te medha bashke. Mbaje ngarkimin total nen 24MB.";
  }
  const invalidType = files.find((file) => file.size > 0 && !file.type.startsWith("image/"));
  if (invalidType) {
    return `"${invalidType.name}" nuk eshte foto e vlefshme.`;
  }
  const oversized = files.find((file) => file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES);
  if (oversized) {
    return `"${oversized.name}" eshte mbi 5MB. Kompresoje ose zgjidh nje foto me te vogel.`;
  }
  return null;
}

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [localError, setLocalError] = useState<string | null>(null);

  function validateSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("images").filter((value) => value instanceof File && value.size > 0) as File[];
    const error = validateImageFiles(files);
    setLocalError(error);
    if (error) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={validateSubmit} className="grid gap-4 rounded-[24px] border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div>
        <h2 className="text-lg font-black text-[#352B24]">Shto produkt</h2>
        <p className="mt-1 text-sm text-[#6f5b4c]">Krijo inventar te kontrolluar perpara se ta kthesh ne ankand.</p>
      </div>
      <Message state={localError ? { error: localError } : state} />
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
      <label className="grid gap-1.5 text-xs font-bold text-[#6f5b4c]">
        Foto produkti (max 5MB per foto)
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          required
          className="rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-xs text-[#6f5b4c]"
        />
      </label>
      <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96C2D] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520] disabled:opacity-60">
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
    <form action={formAction} className="grid gap-4 rounded-[24px] border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div>
        <h2 className="text-lg font-black text-[#352B24]">Programo ankand</h2>
        <p className="mt-1 text-sm text-[#6f5b4c]">Lidhu me nje produkt, cakto oferten minimale dhe kohezgjatjen ne ore. Cmimi rritet vetem nga ofertat e klienteve.</p>
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
        <label className="flex items-start gap-3 rounded-xl border border-[#ead2bc] bg-[#FFF8F1] p-3 text-xs font-bold text-[#6f5b4c]">
          <input type="checkbox" name="autoRelist" value="true" className="mt-0.5 h-4 w-4 accent-[#D96C2D]" />
          <span>
            Rilistim automatik 24h nese nuk ka oferta
            <span className="mt-1 block font-semibold text-[#8a7565]">
              Kur ankandi mbyllet pa oferta, sistemi krijon automatikisht ankand te ri 24 oreshe.
            </span>
          </span>
        </label>
      </div>
      <button disabled={isPending || !hasProducts} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96C2D] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520] disabled:opacity-60">
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
  const [localError, setLocalError] = useState<string | null>(null);

  function validateSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const files = formData.getAll("images").filter((value) => value instanceof File && value.size > 0) as File[];
    const error = validateImageFiles(files);
    setLocalError(error);
    if (error) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={validateSubmit} className="grid gap-4 rounded-[24px] border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div>
        <h2 className="text-lg font-black text-[#352B24]">Perditeso produkt</h2>
        <p className="mt-1 text-sm text-[#6f5b4c]">Edito te dhenat e produktit ose ndrysho statusin.</p>
      </div>
      <Message state={localError ? { error: localError } : state} />
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
      <label className="grid gap-1.5 text-xs font-bold text-[#6f5b4c]">
        Foto te reja (opsionale)
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-xs text-[#6f5b4c]"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#6f5b4c]">
        <input type="checkbox" name="keepExistingImages" value="true" defaultChecked />
        Mbaj fotot ekzistuese
      </label>
      <button
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96C2D] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520] disabled:opacity-60"
      >
        {isPending ? "Duke ruajtur..." : "Ruaj perditesimin"}
      </button>
    </form>
  );
}


