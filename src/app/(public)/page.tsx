import React from "react";
import Link from "next/link";
import { getAuctions } from "@/lib/db";
import CountdownTimer from "@/app/components/CountdownTimer";
import { Gavel, ShieldCheck, Truck, HelpCircle, ArrowRight, Sparkles, Award } from "lucide-react";

export const revalidate = 0; // Ensure live data always queries

export default async function HomePage() {
  const allAuctions = await getAuctions();

  // Filter lists
  const activeAuctions = allAuctions.filter((a) => a.status === "active");
  const endingSoonAuctions = [...activeAuctions]
    .sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime())
    .slice(0, 3);
  const recentWinners = allAuctions.filter((a) => a.status === "ended" && a.winner_id).slice(0, 3);

  // Condition translate map
  const conditionLabels: Record<string, string> = {
    new: "E Re",
    like_new: "Si e Re",
    used_good: "E Përdorur (Mirë)",
    used_fair: "E Përdorur (Kënaqshëm)"
  };

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent z-0" />

        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ankande online për produkte reale</span>
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Oferto. Garo. <span className="text-blue-500">Fito.</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed">
              Merr pjesë në ankande transparente për pajisje teknologjike, orë premium, dhe koleksione unike. Të gjitha produktet postohen dhe kontrollohen ekskluzivisht nga ne. Pa shitës të tretë, pa mashtrime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/auctions"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/25 scale-100 hover:scale-[1.02]"
              >
                <span>Shko te Ankandet</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold transition-colors"
              >
                Si Funksionon?
              </Link>
            </div>
          </div>

          {/* Premium Right Side Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-blue-500/10 absolute -z-10 blur-3xl animate-pulse" />
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
              <div className="absolute -top-5 -left-5 bg-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-lg rotate-12">
                <Gavel className="w-6 h-6 transform -rotate-45" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="aspect-[4/3] w-full rounded-2xl bg-slate-850 overflow-hidden relative border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
                    alt="iPhone"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs uppercase shadow">
                      Si e Re
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Telefona & Teknologji</span>
                  <h3 className="font-extrabold text-white text-lg">iPhone 15 Pro Max - 256GB</h3>
                </div>

                <div className="flex justify-between items-end border-t border-slate-850 pt-3">
                  <div>
                    <span className="text-slate-500 text-xs uppercase">Oferta Më e Lartë</span>
                    <p className="text-2xl font-black text-emerald-400">85,000 Llek</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-xs block mb-1">Mbyllja</span>
                    <span className="px-2.5 py-1 rounded bg-red-500/15 border border-red-500/20 text-red-400 font-black text-xs">
                      2h 15m
                    </span>
                  </div>
                </div>

                <Link
                  href="/auctions/auc-1"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm text-center shadow-lg transition-all"
                >
                  Oferto Tani
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST/SAFETY BADGES */}
      <section className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-900">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Produkte të Kontrolluara</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Çdo produkt sigurohet, testohet dhe postohet drejtpërdrejt nga administratorët tanë. Nuk lejohet asnjë shitës i tretë.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-900">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Ofertim Transparent</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Çdo bid verifikohet server-side në kohë reale. Çmimi përfundimtar është çmimi real i shpallur në fund të ankandit.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-900">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">Pagesa me Postë (Cash)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mbrojtje e plotë: fituesi paguan vetëm kur produkti arrin me korrier në adresën e tij. Pa rreziqe paraprake!
            </p>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE AUCTIONS SECTION */}
      <section className="container mx-auto px-4 flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Ankande Aktive</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Oferto Tani</h2>
          </div>
          <Link href="/auctions" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>Të gjitha ankandet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeAuctions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-3xl border border-slate-900 flex flex-col items-center gap-3">
            <Gavel className="w-12 h-12 text-slate-600" />
            <h3 className="font-bold text-slate-400 text-lg">Nuk ka ankande aktive për momentin</h3>
            <p className="text-slate-500 text-sm">Vizitoni faqen tonë më vonë për produkte të reja.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAuctions.slice(0, 6).map((auc) => (
              <div
                key={auc.id}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-1 shadow-md group"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-slate-950 overflow-hidden relative border border-slate-850">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={auc.product?.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"}
                    alt={auc.product?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-slate-950/80 border border-slate-850 text-slate-300 font-semibold text-2xs uppercase tracking-wider backdrop-blur-sm">
                      {conditionLabels[auc.product?.condition] || auc.product?.condition}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <CountdownTimer endTime={auc.end_time} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-blue-500 text-xs font-semibold uppercase">{auc.category?.name || "Kategori"}</span>
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                    {auc.product?.title}
                  </h3>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-auto">
                  <div>
                    <span className="text-slate-500 text-xs uppercase">Ofertë Aktive</span>
                    <p className="text-lg font-black text-emerald-400">{auc.current_price.toLocaleString()} Llek</p>
                  </div>
                  <Link
                    href={`/auctions/${auc.id}`}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Shiko & Oferto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ENDING SOON SLIDE AREA */}
      {activeAuctions.length > 0 && (
        <section className="bg-slate-900/20 border-y border-slate-900 py-16">
          <div className="container mx-auto px-4 flex flex-col gap-8">
            <div>
              <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Sekondat e Fundit</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Po Mbyllen Së Shpejti</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {endingSoonAuctions.map((auc) => (
                <div
                  key={auc.id}
                  className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-slate-800 shadow"
                >
                  <div className="w-24 h-24 rounded-lg bg-slate-900 overflow-hidden relative border border-slate-850 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={auc.product?.images?.[0]}
                      alt={auc.product?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-2 min-w-0 flex-grow">
                    <h3 className="font-bold text-white text-sm truncate">{auc.product?.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-extrabold text-sm">{auc.current_price.toLocaleString()} Llek</span>
                      <CountdownTimer endTime={auc.end_time} />
                    </div>
                    <Link
                      href={`/auctions/${auc.id}`}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 mt-1"
                    >
                      <span>Oferto Tani</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. HOW IT WORKS SECTION */}
      <section className="container mx-auto px-4 flex flex-col gap-10">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Rregullat</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Si Funksionon Platforma?</h2>
          <p className="text-slate-400 text-sm">Proçesi ynë është i thjeshtë, transparent dhe 100% i sigurtë.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4 text-left relative">
            <span className="absolute top-6 right-6 font-black text-slate-800 text-5xl">01</span>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
              Regjistrohu
            </div>
            <h3 className="font-bold text-white text-lg">1. Krijo Llogarinë Tënde</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Krijo një llogari me email dhe plotëso detajet e plota të adresës dhe telefonit në profilin tënd për të verifikuar identitetin përpara ofertimit.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4 text-left relative">
            <span className="absolute top-6 right-6 font-black text-slate-800 text-5xl">02</span>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              Garo
            </div>
            <h3 className="font-bold text-white text-lg">2. Vendos Oferta Reale</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Gjej produktin që dëshiron dhe oferto. Oferta jote duhet të jetë më e lartë se oferta aktuale duke respektuar hapin minimal të shtimit.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4 text-left relative">
            <span className="absolute top-6 right-6 font-black text-slate-800 text-5xl">03</span>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              Fito
            </div>
            <h3 className="font-bold text-white text-lg">3. Shpallet Fituesi & Merr Produktin</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nëse ke ofertën më të lartë në sekondën e fundit të kohës së ankandit, shpallesh fitues! Porosia krijohet automatikisht dhe dërgohet me postë.
            </p>
          </div>
        </div>
      </section>

      {/* 6. RECENT WINNERS SHOWCASE */}
      {recentWinners.length > 0 && (
        <section className="container mx-auto px-4 flex flex-col gap-8">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Suksesi</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Fituesit e Fundit</h2>
            <p className="text-slate-400 text-sm">Gëzimi i blerjeve të zgjuara me çmime fantastike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentWinners.map((auc) => (
              <div
                key={auc.id}
                className="bg-slate-900/20 border border-slate-900 p-5 rounded-2xl flex flex-col gap-4 text-center items-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <Award className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate max-w-[220px]">{auc.product?.title}</h3>
                  <span className="text-slate-400 text-xs">Fituesi: User ***{auc.winner_id?.substring(0, 5)}</span>
                </div>
                <div className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-sm">
                  {auc.current_price.toLocaleString()} Llek
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FAQ PREVIEW */}
      <section className="container mx-auto px-4 max-w-3xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <span className="text-blue-500 text-xs font-bold uppercase tracking-widest">Pyetje-Përgjigje</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pyetjet e Shpeshta (FAQ)</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-xl text-left">
            <h4 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>A janë produktet origjinale dhe të testuara?</span>
            </h4>
            <p className="text-slate-450 text-sm leading-relaxed">
              Po, absolutisht. Të gjitha produktet sigurohen nga ekipi ynë i administratorëve. Ne i testojmë plotësisht dhe shtojmë shënime të hollësishme testimi në faqen e detajeve për çdo produkt.
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-xl text-left">
            <h4 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Si bëhet dërgimi dhe pagesa e produktit të fituar?</span>
            </h4>
            <p className="text-slate-450 text-sm leading-relaxed">
              Produktet dërgohen me postë ekspres në të gjithë Shqipërinë. Pagesa bëhet Cash (me dorë) te korrieri kur ju merrni dhe konfirmoni produktin. Nuk kërkohet asnjë pagesë paraprake!
            </p>
          </div>
        </div>

        <Link
          href="/faq"
          className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto"
        >
          <span>Lexo të gjitha pyetjet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* 8. STRONG CALL TO ACTION */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 p-8 sm:p-12 rounded-3xl text-center flex flex-col gap-6 items-center max-w-4xl mx-auto shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Gati për të siguruar ofertën tënde të parë?
          </h2>
          <p className="text-slate-350 text-base max-w-xl leading-relaxed">
            Regjistrohu falas sot, plotëso adresën tuaj të dërgimit dhe garo në ankande transparente për produktet tuaja të preferuara!
          </p>
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/25"
          >
            Regjistrohu Tani
          </Link>
        </div>
      </section>
    </div>
  );
}
