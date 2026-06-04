import React from "react";
import Link from "next/link";
import { Gavel, PackageCheck, Search, ShieldCheck, Sparkles, Truck, UserCheck } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    { step: "01", title: "Regjistrohu", desc: "Krijo llogarine dhe ploteso telefonin/adresen te profili.", icon: UserCheck },
    { step: "02", title: "Shfleto", desc: "Zgjidh produkte te kontrolluara me foto dhe raport teknik.", icon: Search },
    { step: "03", title: "Oferto", desc: "Vendos oferten sipas hapit minimal te ankandit.", icon: Gavel },
    { step: "04", title: "Fito", desc: "Oferta me e larte ne fund te kohes fiton produktin.", icon: Sparkles },
    { step: "05", title: "Prano", desc: "Porosia krijohet automatikisht dhe paguhet ne dorezim.", icon: Truck },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <section className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-black uppercase tracking-widest text-[#D96C2D]">Procedura</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#352B24] sm:text-6xl">Si funksionon NjeKlik?</h1>
        <p className="mt-4 text-sm leading-7 text-[#6f5b4c]">
          Nje proces i thjeshte: shfleto produktet, vendos oferten, fito ankandin dhe merr produktin me dergese te sigurt.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {[
          [ShieldCheck, "Platforme e kontrolluar", "Vetem ekipi yne shton produkte. Cdo artikull verifikohet, fotografohet dhe pershkruhet perpara publikimit."],
          [PackageCheck, "Produkte me raport", "Shenimet e testimit, gjendja dhe detajet e produktit shfaqen qarte perpara ofertimit."],
        ].map(([Icon, title, copy]) => (
          <div key={String(title)} className="rounded-[24px] border border-[#f0d9c4] bg-white/84 p-7 shadow-[0_16px_44px_rgba(53,43,36,0.06)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-black text-[#352B24]">{title as string}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6f5b4c]">{copy as string}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-center text-3xl font-black tracking-[-0.03em] text-[#352B24]">Procesi ne 5 hapa</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative rounded-[22px] border border-[#f0d9c4] bg-white/84 p-5">
                <span className="absolute right-4 top-4 text-3xl font-black text-[#F7D8B5]">{item.step}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-5 font-black text-[#352B24]">{item.title}</h4>
                <p className="mt-2 text-xs leading-6 text-[#6f5b4c]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-10 flex max-w-4xl flex-col items-center rounded-[28px] border border-[#f0d9c4] bg-[#fff3e6] p-8 text-center">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[#352B24]">Gati per te filluar ofertimin?</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#6f5b4c]">Regjistrohu sot dhe eksploro produktet e kontrolluara nga administratoret.</p>
        <Link href="/register" className="mt-6 rounded-xl bg-[#D96C2D] px-8 py-3 text-sm font-black text-white">
          Krijo llogarine
        </Link>
      </section>
    </div>
  );
}

