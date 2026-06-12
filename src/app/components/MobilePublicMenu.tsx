"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CircleUserRound, Gavel, HelpCircle, Home, Menu, ShieldCheck, X } from "lucide-react";
import { BrandLogo } from "@/app/components/BrandUi";

const links = [
  { href: "/", label: "Ballina", icon: Home },
  { href: "/auctions", label: "Ankandet", icon: Gavel },
  { href: "/how-it-works", label: "Si funksionon", icon: HelpCircle },
];

interface MobilePublicMenuProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export default function MobilePublicMenu({ isLoggedIn = false, isAdmin = false }: MobilePublicMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? "Mbyll menune" : "Hap menune"}
        aria-expanded={open}
        aria-controls="mobile-public-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f0d9c4] bg-white text-[#352B24]"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div
          id="mobile-public-menu"
          className="absolute left-0 top-14 z-50 w-[min(88vw,320px)] rounded-2xl border border-[#f0d9c4] bg-white p-3 shadow-2xl"
        >
          <BrandLogo className="px-2" />
          <div className="mt-3 grid gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#5e4c3f] hover:bg-[#F7D8B5]/50"
              >
                <Icon className="h-4 w-4 text-[#D96C2D]" />
                {label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <div className="my-2 h-px bg-[#f0d9c4]" />
                <Link
                  href={isAdmin ? "/admin" : "/dashboard/profile"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-[#FFF8F1] px-3 py-3 text-sm font-black text-[#5e4c3f] hover:bg-[#F7D8B5]/50"
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4 text-[#D96C2D]" />
                  ) : (
                    <CircleUserRound className="h-4 w-4 text-[#D96C2D]" />
                  )}
                  {isAdmin ? "Paneli Admin" : "Profili"}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
