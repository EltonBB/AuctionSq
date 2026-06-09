import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/db";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { BrandLogo } from "@/app/components/BrandUi";
import { Award, Gavel, Home, KeyRound, MapPin, Package, User } from "lucide-react";

export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserProfile();
  if (user.id === "usr-guest") {
    redirect("/login");
  }

  if (user.is_admin) {
    redirect("/admin");
  }

  const links = [
    { href: "/", label: "Kreu", icon: Home },
    { href: "/dashboard/bids", label: "Ofertat", icon: Gavel },
    { href: "/dashboard/won", label: "Fitoret", icon: Award },
    { href: "/dashboard/orders", label: "Porosite", icon: Package },
    { href: "/dashboard/profile", label: "Profili", icon: User },
    { href: "/dashboard/addresses", label: "Adresat", icon: MapPin },
    { href: "/dashboard/change-password", label: "Fjalekalimi", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#352B24]">
      <header className="sticky top-0 z-40 border-b border-[#f0d9c4] bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4">
          <BrandLogo compact />
          <form action={signOut}>
            <button className="rounded-xl border border-[#f0c8aa] bg-white px-4 py-2 text-xs font-bold uppercase text-[#8a5c42] transition hover:border-[#df6b2e] hover:text-[#df6b2e]">
              Dil
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-[#f0d9c4] bg-white/80 p-3 shadow-[0_18px_45px_rgba(98,56,28,0.08)] lg:sticky lg:top-24">
          <nav className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-bold text-[#6f5a4b] transition hover:bg-[#fff3e8] hover:text-[#df6b2e]">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

