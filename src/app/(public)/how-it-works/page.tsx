import React from "react";
import Link from "next/link";
import { Gavel, ShieldCheck, UserCheck, Truck, Sparkles, FileSpreadsheet } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col gap-20">
      {/* Page Header */}
      <div className="text-center flex flex-col gap-4 max-w-xl mx-auto">
        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Procedura</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Si Funksionon Oferto?</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Mësoni rregullat tona të thjeshta dhe të drejta të krijuara për të ofruar siguri maksimale për çdo blerës.
        </p>
      </div>

      {/* Rregullat e Artë - Rules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-3xl flex flex-col gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-lg">Platformë e Kontrolluar (Jo Marketplace)</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ndryshe nga faqet e tjera ku çdokush mund të shesë çfarëdo gjëje, tek **Oferto** vetëm ekipi ynë i administratorëve mund të shtojë produkte dhe të krijojë ankande. Çdo produkt blihet, verifikohet teknikisht, pastrohet dhe fotografohet nga ne përpara se të listohet!
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-3xl flex flex-col gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-lg">Verifikimi i Ofertuesve</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Për të parandaluar bidet e rreme ose profilet anonime që dëmtojnë garën, të gjithë përdoruesit duhet të regjistrohen dhe të plotësojnë profilin me emër të plotë, telefon të saktë dhe adresën e tyre të dërgimit përpara se të vendosin ofertën e parë.
          </p>
        </div>
      </section>

      {/* Step by Step Breakdown */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Udhëzuesi</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Proçesi në 5 Hapa të Thjeshtë</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          {[
            { step: "01", title: "Regjistrimi", desc: "Krijo llogarinë dhe plotëso adresën tuaj të dërgimit dhe telefonin te faqja e profilit.", icon: UserCheck },
            { step: "02", title: "Shfleto", desc: "Zgjidhni nga produktet tona të reja ose të përdorura, secila e pajisur me raport teknik.", icon: FileSpreadsheet },
            { step: "03", title: "Garo", desc: "Vendosni ofertat tuaja duke shtuar vlerën e bidit sipas hapit minimal ose butonave të shpejtë.", icon: Gavel },
            { step: "04", title: "Fito", desc: "Nëse jeni ofertuesi më i lartë në përfundim të kohës së ankandit, ju fitoni ankandin!", icon: Sparkles },
            { step: "05", title: "Prano", desc: "Porosia krijohet automatikisht. Posta jua sjell produktin dhe ju paguani Cash në dorëzim.", icon: Truck }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-900/10 border border-slate-900 p-6 rounded-2xl flex flex-col gap-4 relative">
                <span className="absolute top-4 right-4 font-black text-slate-800 text-3xl">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <h4 className="font-bold text-white text-base leading-tight">{item.title}</h4>
                  <p className="text-slate-450 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 p-8 sm:p-12 rounded-3xl text-center flex flex-col gap-6 items-center max-w-4xl mx-auto shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Gati për të filluar ofertimin tuaj?
        </h2>
        <p className="text-slate-350 text-sm max-w-md">
          Regjistrohu sot dhe eksploro produktet unike të postuara dhe të kontrolluara nga administratorët.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow shadow-blue-500/20"
        >
          Krijo Llogarinë
        </Link>
      </section>
    </div>
  );
}
