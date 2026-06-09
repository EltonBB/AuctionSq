import React from "react";
import { PasswordForm } from "@/app/components/AccountForms";
import { ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default function ChangePasswordPage() {
  return (
    <div className="grid max-w-2xl gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-[#352B24]">Ndrysho Fjalekalimin</h1>
        <p className="mt-1 text-sm text-[#7c614f]">Perdorni nje fjalekalim te forte per te mbrojtur llogarine dhe ofertat tuaja.</p>
      </div>
      <div className="rounded-3xl border border-[#f0d9c4] bg-white/85 p-6 shadow-[0_18px_45px_rgba(98,56,28,0.08)]">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#f0c8aa] bg-[#fff7ed] p-4">
          <ShieldCheck className="mt-1 h-5 w-5 text-[#df6b2e]" />
          <p className="text-sm leading-6 text-[#6f5a4b]">
            Pas ndryshimit, ruani fjalekalimin ne nje vend te sigurt. Llogaria juaj kontrollon ofertat, fitoret dhe porosite.
          </p>
        </div>
        <PasswordForm />
      </div>
    </div>
  );
}

