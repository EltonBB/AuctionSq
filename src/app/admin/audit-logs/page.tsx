import React from "react";
import { getAuditLogs } from "@/lib/db";

export const revalidate = 0;

function toFriendlyAction(action: string) {
  const map: Record<string, string> = {
    category_create: "Kategori e re u krijua",
    product_create: "Produkt i ri u shtua",
    product_edit: "Produkt u perditesua",
    product_status_change: "Statusi i produktit u ndryshua",
    product_delete: "Produkti u fshi",
    auction_create: "Ankand i ri u krijua",
    auction_cancel: "Ankand u anulua",
    auction_relist: "Ankand u rilistua",
    bid_cancel: "Oferte u anulua",
    order_status_change: "Statusi i porosise u ndryshua",
    user_restrict: "Statusi i klientit u ndryshua",
  };
  return map[action] || "Veprim administrativ";
}

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Aktiviteti</h1>
        <p className="mt-1 text-sm text-[#8a7565]">Historik i thjeshte i veprimeve te fundit ne panel.</p>
      </div>
      <div className="grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-[#f0d9c4] bg-[#FFF8F1] p-4">
            <p className="font-black text-[#352B24]">{toFriendlyAction(log.action)}</p>
            <p className="mt-1 text-sm text-[#6f5b4c]">
              Nga: {log.performer?.full_name || "Sistem"} - {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {logs.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF8F1] p-8 text-center text-sm text-[#8a7565]">Nuk ka aktivitet ende.</p>
        ) : null}
      </div>
    </section>
  );
}


