import React from "react";
import { getAuditLogs } from "@/lib/db";

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Administrative activity trail for product, auction, bid, user, and order changes.</p>
      </div>
      <div className="grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="font-black text-slate-950">{log.action}</p>
                <p className="mt-1 text-sm text-slate-500">By {log.performer?.full_name || log.performed_by} · {new Date(log.created_at).toLocaleString()}</p>
              </div>
              <code className="max-w-full overflow-x-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-600">{JSON.stringify(log.details)}</code>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No audit activity yet.</p>}
      </div>
    </section>
  );
}
