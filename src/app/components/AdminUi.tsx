"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, FolderTree, Gavel, Loader2, ScrollText, Settings, ShoppingBag, Users } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

const iconMap = {
  overview: BarChart3,
  products: Boxes,
  auctions: Gavel,
  bids: ClipboardList,
  orders: ShoppingBag,
  users: Users,
  categories: FolderTree,
  logs: ScrollText,
  settings: Settings,
} as const;
export type AdminSidebarIconKey = keyof typeof iconMap;

export function AdminSidebarNav({
  links,
}: {
  links: { href: string; label: string; icon: AdminSidebarIconKey }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {links.map((link) => {
        const Icon = iconMap[link.icon];
        const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              active ? "bg-[#082047] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#082047]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminFormNotice({ message, error }: { message?: string | null; error?: string | null }) {
  if (!message && !error) return null;
  return (
    <p
      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
        error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error || message}
    </p>
  );
}

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  className: string;
  confirmMessage: string;
}) {
  const { pending } = useFormStatus();
  const approvedRef = useRef(false);

  useEffect(() => {
    if (!pending) approvedRef.current = false;
  }, [pending]);

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (approvedRef.current) return;
        const ok = window.confirm(confirmMessage);
        if (!ok) {
          event.preventDefault();
          return;
        }
        approvedRef.current = true;
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
