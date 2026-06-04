import React from "react";
import { PasswordForm } from "@/app/components/AccountForms";
import { ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default function ChangePasswordPage() {
  return (
    <div className="grid max-w-2xl gap-8 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Ndrysho Fjalekalimin</h1>
        <p className="mt-1 text-sm text-slate-400">Perdorni nje fjalekalim te forte per te mbrojtur llogarine dhe ofertat tuaja.</p>
      </div>
      <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <ShieldCheck className="mt-1 h-5 w-5 text-blue-300" />
          <p className="text-sm leading-6 text-slate-300">
            Pas ndryshimit, ruani fjalekalimin ne nje vend te sigurt. Llogaria juaj kontrollon ofertat, fitoret dhe porosite.
          </p>
        </div>
        <PasswordForm />
      </div>
    </div>
  );
}

