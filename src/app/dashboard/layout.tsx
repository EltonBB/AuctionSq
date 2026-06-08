import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/db";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { BrandLogo } from "@/app/components/BrandUi";

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
    { href: "/dashboard", label: "Permbledhje" },
    { href: "/dashboard/bids", label: "Ofertat" },
    { href: "/dashboard/won", label: "Fitoret" },
    { href: "/dashboard/orders", label: "Porosite" },
    { href: "/dashboard/profile", label: "Profili" },
    { href: "/dashboard/addresses", label: "Adresat" },
    { href: "/dashboard/change-password", label: "Fjalekalimi" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-900 bg-slate-950/95">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4">
          <BrandLogo compact />
          <form action={signOut}>
            <button className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-bold uppercase text-slate-300 hover:text-white">
              Dil
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/30 p-3">
          <nav className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 font-bold text-slate-300 hover:bg-slate-900 hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

