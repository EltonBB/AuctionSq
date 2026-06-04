import React from "react";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#D96C2D]">
          <MessageSquare className="h-4 w-4" />
          Komunikimi
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#352B24] sm:text-6xl">Na kontaktoni</h1>
        <p className="mt-4 text-sm leading-7 text-[#6f5b4c]">
          Keni pyetje per nje ankand apo porosi? Ekipi yne eshte gati t&apos;ju ndihmoje.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="grid gap-5 rounded-[24px] border border-[#f0d9c4] bg-white/86 p-6">
            <h3 className="border-b border-[#f0d9c4] pb-3 text-lg font-black text-[#352B24]">Informacione kontakti</h3>
            {[
              [Phone, "Numri i telefonit", "+355 69 123 4567", "E hene - E shtune, 09:00 - 18:00"],
              [Mail, "Adresa email", "support@njeklik.com", "Pergjigje brenda 24 oreve"],
              [MapPin, "Lokacioni yne", "Tirane, Shqiperi", "Sherbim ne te gjithe vendin"],
            ].map(([Icon, title, value, note]) => (
              <div key={String(title)} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D8B5] text-[#D96C2D]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#352B24]">{title as string}</h4>
                  <p className="mt-0.5 text-sm text-[#6f5b4c]">{value as string}</p>
                  <p className="text-xs italic text-[#8a7565]">{note as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[24px] border border-[#f0d9c4] bg-white/86 p-6 text-left md:p-8">
            <h3 className="mb-6 border-b border-[#f0d9c4] pb-3 text-lg font-black text-[#352B24]">Na dergoni nje mesazh</h3>
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
                  Emri juaj
                  <input type="text" required placeholder="Filan Fisteku" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
                  Numri i telefonit
                  <input type="tel" required placeholder="+35569XXXXXXX" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
                Adresa email
                <input type="email" required placeholder="shembull@email.com" className="brand-focus rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase text-[#8a7565]">
                Mesazhi juaj
                <textarea rows={4} required placeholder="Shkruani pyetjen ose detajet e problemit tuaj..." className="brand-focus resize-none rounded-xl border border-[#ead2bc] bg-white px-4 py-3 text-sm normal-case text-[#352B24]" />
              </label>
              <button type="submit" className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#D96C2D] py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#bf5520]">
                <Send className="h-4 w-4" />
                Dergo mesazhin
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

