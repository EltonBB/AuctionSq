"use client";

import { useActionState } from "react";
import { updateOrderStatus } from "@/app/actions/admin";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const statuses = ["pending_confirmation", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState(async (_: unknown, formData: FormData) => {
    return updateOrderStatus(String(formData.get("orderId") || ""), String(formData.get("status") || ""));
  }, null);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select name="status" defaultValue={currentStatus} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {state?.error && (
        <p className="inline-flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="inline-flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-xl bg-[#D96C2D] px-4 py-2 text-xs font-black uppercase text-white shadow-sm transition hover:bg-[#c45f27] disabled:opacity-60"
      >
        {pending ? "Duke perditesuar..." : "Perditeso statusin"}
      </button>
    </form>
  );
}

