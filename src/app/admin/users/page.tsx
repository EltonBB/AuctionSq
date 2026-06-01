import React from "react";
import { getCustomerProfiles } from "@/lib/db";
import { AdminUsersTable } from "@/app/components/AdminUsersTable";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await getCustomerProfiles();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Menaxhimi i Klientëve</h1>
        <p className="mt-1 text-sm text-slate-500">Shfaqen vetëm llogaritë e klientëve. Llogaritë admin nuk shfaqen këtu.</p>
      </div>
      <AdminUsersTable users={users} />
    </section>
  );
}
