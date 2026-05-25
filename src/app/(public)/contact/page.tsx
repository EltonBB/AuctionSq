import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col gap-12 max-w-5xl">
      {/* Header */}
      <div className="text-center flex flex-col gap-4 max-w-xl mx-auto">
        <span className="text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 justify-center">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>Komunikimi</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Na Kontaktoni</h1>
        <p className="text-slate-400 text-sm">
          Keni pyetje, sugjerime apo kërkoni ndihmë me një ankand apo porosi? Ekipi ynë është i gatshëm t&apos;ju ndihmojë.
        </p>
      </div>

      {/* Grid of form and detail split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Contact details (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col gap-6">
            <h3 className="font-extrabold text-white text-lg border-b border-slate-900 pb-3">Informacione Kontakti</h3>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Numri i Telefonit</h4>
                <p className="text-slate-400 text-xs mt-0.5">+355 69 123 4567</p>
                <p className="text-slate-500 text-3xs italic">E hënë - E shtunë, 09:00 - 18:00</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Adresa Email</h4>
                <p className="text-slate-400 text-xs mt-0.5">support@auctionsq.com</p>
                <p className="text-slate-500 text-3xs italic">Përgjigje brenda 24 orëve</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Lokacioni ynë</h4>
                <p className="text-slate-400 text-xs mt-0.5">Rruga Myslym Shyri, Pallati 25</p>
                <p className="text-slate-500 text-3xs italic">Tirana, Shqipëri</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact form (7 columns) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/30 border border-slate-900 p-6 sm:p-8 rounded-2xl text-left">
            <h3 className="font-extrabold text-white text-lg mb-6 border-b border-slate-900 pb-3">Na Dërgoni një Mesazh</h3>

            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 text-2xs uppercase font-semibold">Emri Juaj</label>
                  <input
                    type="text"
                    required
                    placeholder="Filan Fisteku"
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-550 text-2xs uppercase font-semibold">Numri i Telefonit</label>
                  <input
                    type="tel"
                    required
                    placeholder="+35569XXXXXXX"
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 text-2xs uppercase font-semibold">Adresa Email</label>
                <input
                  type="email"
                  required
                  placeholder="shembull@email.com"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-550 text-2xs uppercase font-semibold">Mesazhi Juaj</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Shkruani pyetjen ose detajet e problemit tuaj..."
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow shadow-blue-500/10 mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dërgo Mesazhin</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
