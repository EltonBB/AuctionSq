"use client";

import { submitCreateCategory } from "@/app/actions/admin";
import { useActionState } from "react";
import { AdminFormNotice } from "@/app/components/AdminUi";

export function AdminCategoryForm() {
  const [state, action, pending] = useActionState(submitCreateCategory, null);
  return (
    <form action={action} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Shto kategori</h2>
      <div className="mt-4 grid gap-3">
        <AdminFormNotice message={state?.success ? state.message : null} error={state?.success ? null : state?.error} />
        <input name="name" required placeholder="Emri i kategorise" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        <input name="slug" required placeholder="Slug (p.sh. teknologji)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        <textarea name="description" rows={4} placeholder="Pershkrim i shkurter" className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        <button disabled={pending} className="rounded-xl bg-[#D96C2D] px-5 py-3 text-xs font-black uppercase text-white shadow-sm transition hover:bg-[#c45f27] disabled:opacity-60">
          {pending ? "Duke ruajtur..." : "Krijo kategorine"}
        </button>
      </div>
    </form>
  );
}

