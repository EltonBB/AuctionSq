import React from "react";
import { getAuctions, getCategories } from "@/lib/db";
import { AdminCategoryForm } from "@/app/components/AdminCategoryForm";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, auctions] = await Promise.all([getCategories(), getAuctions()]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Kategoritë</h1>
          <p className="mt-1 text-sm text-slate-500">Struktura kryesore e navigimit publik.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-slate-200 p-4">
              <h2 className="font-black">{category.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{category.description}</p>
              <p className="mt-3 text-xs font-bold text-blue-700">{auctions.filter((auction) => auction.product?.category_id === category.id).length} ankande</p>
            </div>
          ))}
        </div>
      </section>
      <AdminCategoryForm />
    </div>
  );
}
