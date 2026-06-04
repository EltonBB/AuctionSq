import React from "react";
import { getAuctions, getCategories } from "@/lib/db";
import { AdminCategoryForm } from "@/app/components/AdminCategoryForm";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, auctions] = await Promise.all([getCategories(), getAuctions()]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Kategorite</h1>
          <p className="mt-1 text-sm text-[#8a7565]">Struktura kryesore e navigimit publik.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-[#f0d9c4] p-4">
              <h2 className="font-black">{category.name}</h2>
              <p className="mt-1 text-sm text-[#8a7565]">{category.description}</p>
              <p className="mt-3 text-xs font-bold text-[#D96C2D]">{auctions.filter((auction) => auction.product?.category_id === category.id).length} ankande</p>
            </div>
          ))}
        </div>
      </section>
      <AdminCategoryForm />
    </div>
  );
}


