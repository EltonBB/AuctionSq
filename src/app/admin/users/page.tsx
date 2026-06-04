import React from "react";
import { getCustomerProfiles } from "@/lib/db";
import { AdminUsersTable } from "@/app/components/AdminUsersTable";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await getCustomerProfiles();

  return (
    <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Menaxhimi i Klienteve</h1>
        <p className="mt-1 text-sm text-[#8a7565]">Shfaqen vetem llogarite e klienteve. Llogarite admin nuk shfaqen ketu.</p>
      </div>
      <AdminUsersTable users={users} />
    </section>
  );
}


