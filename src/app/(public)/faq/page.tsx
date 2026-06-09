import React from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare, Sparkles } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Si mund te vendos nje oferte ne ankand?",
      a: "Krijoni llogari, hyni ne sistem dhe plotesoni profilin me emer, telefon dhe adrese dergese. Me pas hapni produktin dhe vendosni oferten sipas minimumit te lejuar.",
    },
    {
      q: "Sa eshte shuma minimale qe mund te shtoj?",
      a: "Cdo ankand ka hap minimal te ofertes. Oferta e re duhet te jete te pakten sa cmimi aktual plus ate hap minimal.",
    },
    {
      q: "A ka shites te trete ne NjeKlik?",
      a: "Jo. Produktet sigurohen, kontrollohen dhe publikohen nga administratoret e platformes, qe pershkrimi dhe gjendja te jene te qarta.",
    },
    {
      q: "Si funksionon pagesa dhe dergimi?",
      a: "Kur fitoni nje ankand, krijohet porosia. Ekipi konfirmon detajet dhe dergesa behet me pagese ne dorezim.",
    },
    {
      q: "efare ndodh me ofertat e rreme?",
      a: "Administratoret monitorojne ofertat. Nese nje oferte duket abuzive, mund te anulohet dhe llogaria mund te kufizohet.",
    },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#D96C2D]">
          <MessageSquare className="h-4 w-4" />
          Ndihme & Pyetje
        </span>
          <h1 className="mt-4 text-4xl font-black text-[#352B24] sm:text-6xl">Pyetjet e shpeshta</h1>
        <p className="mt-4 text-sm leading-7 text-[#6f5b4c]">Pergjigje te shpejta per ofertimin, sigurine dhe dergesat.</p>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.q} className="rounded-[22px] border border-[#f0d9c4] bg-white/86 p-6">
            <h4 className="flex items-start gap-3 text-base font-black text-[#352B24]">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#D96C2D]" />
              <span>{faq.q}</span>
            </h4>
            <p className="mt-3 pl-8 text-sm leading-7 text-[#6f5b4c]">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-[24px] border border-[#f0d9c4] bg-[#fff3e6] p-6 text-center sm:flex-row sm:text-left">
        <div>
          <h4 className="flex items-center justify-center gap-2 text-sm font-black text-[#352B24] sm:justify-start">
            <Sparkles className="h-4 w-4 text-[#D96C2D]" />
            Keni ende pyetje?
          </h4>
          <p className="mt-1 text-sm text-[#6f5b4c]">Na shkruani dhe ekipi yne do t&apos;ju pergjigjet.</p>
        </div>
        <Link href="/contact" className="rounded-xl bg-[#D96C2D] px-6 py-3 text-sm font-black text-white">
          Na kontaktoni
        </Link>
      </div>
    </div>
  );
}

