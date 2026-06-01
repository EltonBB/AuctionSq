import React from "react";
import { ShieldCheck, TimerReset, Truck } from "lucide-react";

export const revalidate = 0;

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black">Cilesimet</h1>
        <p className="mt-1 text-sm text-slate-500">Rregulla operacionale dhe status i automatizimeve.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Modeli i besimit</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Vetem adminet krijojne produkte dhe ankande. Klientet bejne oferte pasi plotesojne profilin.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Truck className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Rrjedha e porosise</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Porosite kalojne ne hapa te kontrolluar deri te dorezimi.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <TimerReset className="h-7 w-7 text-blue-700" />
          <h2 className="mt-4 font-black">Mbyllja automatike</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Ankandet e skaduara mbyllen automatikisht dhe fituesi regjistrohet pa nderhyrje manuale.</p>
        </div>
      </div>
    </div>
  );
}
