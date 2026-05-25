import React from "react";
import Link from "next/link";
import { HelpCircle, Sparkles, MessageSquare } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Si mund të vendos një ofertë në ankand?",
      a: "Për të vendosur një ofertë, së pari duhet të krijoni një llogari falas dhe të hyni në të. Më pas, është e detyrueshme të plotësoni adresën tuaj të dërgimit dhe numrin e telefonit te faqja e profilit në panelin tuaj. Kjo na ndihmon të parandalojmë profilet e rreme dhe të sigurojmë një garë të pastër."
    },
    {
      q: "Sa është shuma minimale që mund të shtoj në një ofertë?",
      a: "Secili ankand ka të përcaktuar një 'Hap Minimal të Shtimit' (p.sh. 1,000 Llek ose 2,000 Llek). Çdo ofertë e re duhet të jetë të paktën sa çmimi aktual plus hapin minimal të shtimit. Ju mund të përdorni butonat e shpejtë (+1,000, +2,000 etj.) në faqen e produktit ose të shkruani një vlerë të personalizuar më të lartë."
    },
    {
      q: "A ka shitës të tretë në këtë faqe?",
      a: "Jo. Kjo nuk është një faqe e tipit marketplace ku përdoruesit mund të shesin produktet e tyre. Të gjitha produktet sigurohen, testohen, certifikohen dhe postohen ekskluzivisht nga administratorët e Oferto. Kjo garanton që çdo produkt është 100% origjinal dhe në përputhje me raportin teknik të shfaqur."
    },
    {
      q: "Si funksionon pagesa dhe dërgimi?",
      a: "Kur ju fitoni një ankand, një porosi krijohet automatikisht në dashboard-in tuaj. Ju duhet të konfirmoni adresën e dërgimit brenda 24 orëve. Dërgesa bëhet me postë ekspres kudo në Shqipëri dhe pagesa kryhet Cash (me para në dorë) te korrieri kur pranoni dhe kontrolloni fizikish produktin."
    },
    {
      q: "Çfarë ndodh nëse dikush bën oferta të rreme?",
      a: "Biding i rremë është i ndaluar. Administratorët monitorojnë në kohë reale të gjitha ofertat. Nëse identifikohen oferta të dyshimta ose abuzive, bidi anulohet menjëherë (duke rikthyer çmimin te bidi i mëparshëm), llogaria bllokohet dhe ndalohet përgjithmonë nga pjesëmarrja."
    },
    {
      q: "A mund të ndryshoj adresën time të porosisë?",
      a: "Po. Ju mund të ndryshoni adresën e dërgimit të porosisë nga dashboard-i juaj për sa kohë statusi i porosisë është në gjendjen 'Pending Confirmation' ose 'Confirmed'. Pasi porosia të kalojë në proçesim ose të niset me postë, ndryshimi i adresës nuk lejohet."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col gap-12 max-w-4xl">
      {/* Header */}
      <div className="text-center flex flex-col gap-4 max-w-xl mx-auto">
        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 justify-center">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>Ndihmë & Pyetje</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Pyetjet e Shpeshta (FAQ)</h1>
        <p className="text-slate-400 text-sm">
          Gjeni përgjigje të shpejta për të gjitha pyetjet tuaja rreth ofertimit, sigurisë dhe dërgesave.
        </p>
      </div>

      {/* Grid of Accordions */}
      <div className="flex flex-col gap-6 text-left">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col gap-2.5 transition-colors hover:border-slate-850"
          >
            <h4 className="font-extrabold text-white text-base flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed pl-7 whitespace-pre-line">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Safe bottom widget */}
      <div className="bg-slate-900/10 border border-slate-900 p-8 rounded-2xl text-center flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-left flex flex-col gap-1">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Keni ende pyetje të tjera?</span>
          </h4>
          <p className="text-slate-500 text-xs">Na shkruani dhe ekipi ynë do t&apos;ju përgjigjet brenda pak minutave.</p>
        </div>
        <Link
          href="/contact"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
        >
          Na Kontaktoni
        </Link>
      </div>
    </div>
  );
}
