import React from "react";
import { ShieldCheck, TimerReset, Truck } from "lucide-react";

export const revalidate = 0;

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
        <h1 className="text-2xl font-black">Cilesimet</h1>
        <p className="mt-1 text-sm text-[#8a7565]">Rregulla operacionale dhe status i automatizimeve.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
          <ShieldCheck className="h-7 w-7 text-[#D96C2D]" />
          <h2 className="mt-4 font-black">Modeli i besimit</h2>
          <p className="mt-2 text-sm leading-6 text-[#8a7565]">Vetem adminet krijojne produkte dhe ankande. Klientet bejne oferte pasi plotesojne profilin.</p>
        </div>
        <div className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
          <Truck className="h-7 w-7 text-[#D96C2D]" />
          <h2 className="mt-4 font-black">Rrjedha e porosise</h2>
          <p className="mt-2 text-sm leading-6 text-[#8a7565]">Porosite kalojne ne hapa te kontrolluar deri te dorezimi.</p>
        </div>
        <div className="rounded-2xl border border-[#f0d9c4] bg-white/86 p-5 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
          <TimerReset className="h-7 w-7 text-[#D96C2D]" />
          <h2 className="mt-4 font-black">Mbyllja automatike</h2>
          <p className="mt-2 text-sm leading-6 text-[#8a7565]">Ankandet e skaduara mbyllen automatikisht dhe fituesi regjistrohet pa nderhyrje manuale.</p>
        </div>
      </div>
    </div>
  );
}


