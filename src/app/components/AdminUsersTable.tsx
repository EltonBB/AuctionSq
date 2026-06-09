"use client";

import { submitDeleteCustomerAccount, submitToggleUserBlock } from "@/app/actions/admin";
import type { Profile } from "@/lib/db";
import { useActionState } from "react";
import { AdminFormNotice, ConfirmSubmitButton } from "@/app/components/AdminUi";

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const [state, action] = useActionState(submitToggleUserBlock, null);
  const [deleteState, deleteAction] = useActionState(submitDeleteCustomerAccount, null);

  return (
    <div className="overflow-x-auto">
      <AdminFormNotice message={state?.success ? state.message : null} error={state?.success ? null : state?.error} />
      <AdminFormNotice
        message={deleteState?.success ? deleteState.message : null}
        error={deleteState?.success ? null : deleteState?.error}
      />
      <table className="mt-3 w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-3">Klienti</th>
            <th>Kontakti</th>
            <th>Adresa</th>
            <th>Statusi</th>
            <th>Veprimi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const complete = !!user.phone_number && !!user.city && !!user.address;
            return (
              <tr key={user.id}>
                <td className="py-4 font-bold">{user.full_name || "Pa emer"}</td>
                <td className="text-slate-500">{user.phone_number || "Mungon"}</td>
                <td className="max-w-xs truncate text-slate-500">
                  {complete ? `${user.city}, ${user.address}` : "Profili i paplote"}
                </td>
                <td>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      user.is_blocked
                        ? "bg-red-50 text-red-700"
                        : complete
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {user.is_blocked ? "i bllokuar" : complete ? "gati" : "i paplote"}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                  <form action={action}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="blocked" value={String(!user.is_blocked)} />
                    <ConfirmSubmitButton
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
                        user.is_blocked
                          ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
                      confirmMessage={user.is_blocked ? "Zhblloko kete klient?" : "Blloko kete klient?"}
                    >
                      {user.is_blocked ? "Zhblloko" : "Blloko"}
                    </ConfirmSubmitButton>
                  </form>
                  <form action={deleteAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <ConfirmSubmitButton
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50"
                      confirmMessage="Fshi kete klient? Lejohet vetem kur nuk ka porosi/oferta aktive."
                    >
                      Fshi
                    </ConfirmSubmitButton>
                  </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

