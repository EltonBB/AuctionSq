"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BrandLogo } from "@/app/components/BrandUi";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="brand-surface relative min-h-[100dvh] overflow-hidden text-[#352B24] lg:grid lg:grid-cols-[minmax(520px,1fr)_minmax(0,0.95fr)]">
      <Link
        href="/"
        className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full bg-white/86 px-4 py-2 text-xs font-black text-[#5e4c3f] shadow-[0_12px_32px_rgba(53,43,36,0.10)] ring-1 ring-[#f0d9c4] transition hover:text-[#D96C2D] active:translate-y-px lg:left-8 lg:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu prapa
      </Link>

      <section className="relative flex min-h-[100dvh] items-center justify-center px-5 py-20 sm:px-8 lg:bg-white lg:px-12 lg:py-12">
        <div className="w-full max-w-[460px]">
          {children}
        </div>
      </section>

      <AuthVisualPanel />
    </main>
  );
}

function AuthVisualPanel() {
  return (
    <aside className="relative hidden min-h-[100dvh] overflow-hidden bg-[#130d0a] lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/home-hero-products.jpg"
        alt="Produkte te zgjedhura per ankand nga NjeKlik"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_35%,rgba(217,108,45,0.18),transparent_34%),linear-gradient(90deg,rgba(19,13,10,0.96),rgba(19,13,10,0.64)_48%,rgba(19,13,10,0.18))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#130d0a] via-[#130d0a]/68 to-transparent" />

      <div className="absolute bottom-10 left-8 max-w-[440px] text-left text-white xl:bottom-14 xl:left-12">
        <p className="text-3xl font-black leading-tight text-white xl:text-4xl">
          Eksperienca e ankandit fillon ketu.
        </p>
        <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-white">
          Hyni, plotesoni te dhenat dhe ofertoni per produkte reale te kontrolluara nga ekipi yne.
        </p>
      </div>
    </aside>
  );
}

export function AuthBrandHeader({
  icon,
  title,
  copy,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <BrandLogo />
      </div>
      <div className="mt-5 flex justify-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7D8B5] text-[#D96C2D] shadow-[inset_0_0_0_1px_rgba(217,108,45,0.16)]">
          {icon}
        </span>
      </div>
      <h1 className="mt-4 text-2xl font-black leading-tight text-[#352B24]">{title}</h1>
      <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-6 text-[#6f5b4c]">{copy}</p>
    </div>
  );
}

export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs font-bold text-[#a99584]">
      <span className="h-px flex-1 bg-[#f0d9c4]" />
      {children}
      <span className="h-px flex-1 bg-[#f0d9c4]" />
    </div>
  );
}

export function GoogleLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/google-g.svg" alt="" className="h-5 w-5" />
  );
}

export function AuthFooter() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium text-[#a99584]">
      <Link href="/contact" className="transition hover:text-[#D96C2D]">Kontakt</Link>
      <span aria-hidden="true">.</span>
      <Link href="/faq" className="transition hover:text-[#D96C2D]">Ndihme</Link>
      <span aria-hidden="true">.</span>
      <span>2026 NjeKlik</span>
    </div>
  );
}

export function AuthTinyTrust() {
  return (
    <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#8a7565]">
      <Sparkles className="h-3.5 w-3.5 text-[#D96C2D]" />
      Ankande te kontrolluara nga ekipi NjeKlik
    </p>
  );
}
