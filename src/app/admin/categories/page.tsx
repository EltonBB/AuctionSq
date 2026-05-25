import React from "react";
import { createCategory } from "@/app/actions/admin";
import { getAuctions, getCategories } from "@/lib/db";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, auctions] = await Promise.all([getCategories(), getAuctions()]);

  async function create(formData: FormData) {
    "use server";
    await createCategory(String(formData.get("name")), String(formData.get("slug")), String(formData.get("description") || ""));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Main browsing structure for the public website.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-slate-200 p-4">
              <h2 className="font-black">{category.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{category.description}</p>
              <p className="mt-3 text-xs font-bold text-blue-700">{auctions.filter((auction) => auction.product?.category_id === category.id).length} auctions</p>
            </div>
          ))}
        </div>
      </section>
      <form action={create} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Add category</h2>
        <div className="mt-4 grid gap-3">
          <input name="name" required placeholder="Name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <input name="slug" required placeholder="slug" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <textarea name="description" rows={4} placeholder="Description" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <button className="rounded-xl bg-[#082047] px-5 py-3 text-xs font-black uppercase text-white">Create category</button>
        </div>
      </form>
    </div>
  );
}
