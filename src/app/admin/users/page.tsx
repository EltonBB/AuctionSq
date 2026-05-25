import React from "react";
import { toggleUserBlock } from "@/app/actions/admin";
import { getProfiles } from "@/lib/db";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await getProfiles();

  async function toggle(formData: FormData) {
    "use server";
    await toggleUserBlock(String(formData.get("userId")), String(formData.get("blocked")) === "true");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Users Management</h1>
        <p className="mt-1 text-sm text-slate-500">Review buyer readiness, admin accounts, and bidding restrictions.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3">User</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const complete = !!user.phone_number && !!user.city && !!user.address;
              return (
                <tr key={user.id}>
                  <td className="py-4 font-bold">{user.full_name}</td>
                  <td className="text-slate-500">{user.phone_number || "Missing"}</td>
                  <td className="max-w-xs truncate text-slate-500">{complete ? `${user.city}, ${user.address}` : "Profile incomplete"}</td>
                  <td><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{user.is_admin ? "admin" : "buyer"}</span></td>
                  <td><span className={`rounded-md px-2 py-1 text-xs font-bold ${user.is_blocked ? "bg-red-50 text-red-700" : complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.is_blocked ? "blocked" : complete ? "ready" : "incomplete"}</span></td>
                  <td>
                    {!user.is_admin && (
                      <form action={toggle}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="blocked" value={String(!user.is_blocked)} />
                        <button className={`rounded-lg border px-3 py-2 text-xs font-black ${user.is_blocked ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-700 hover:bg-red-50"}`}>
                          {user.is_blocked ? "Unblock" : "Block"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
