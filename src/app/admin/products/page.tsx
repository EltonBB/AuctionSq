import React from "react";
import { ProductCreateForm } from "@/app/components/AdminForms";
import { getCategories, getProducts } from "@/lib/db";

export const revalidate = 0;

const conditionLabel: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  used_good: "Used good",
  used_fair: "Used fair",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-black">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Inventory, images, descriptions, conditions, and testing notes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3">Product</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Testing notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.images?.[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div>
                        <p className="font-black text-slate-900">{product.title}</p>
                        <p className="max-w-md truncate text-xs text-slate-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{categories.find((category) => category.id === product.category_id)?.name || "Unassigned"}</td>
                  <td><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{conditionLabel[product.condition]}</span></td>
                  <td><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{product.status}</span></td>
                  <td className="max-w-xs truncate text-slate-500">{product.testing_notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ProductCreateForm categories={categories} />
    </div>
  );
}
