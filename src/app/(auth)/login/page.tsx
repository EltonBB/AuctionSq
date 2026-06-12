"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signInWithGoogle } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { AuthDivider, AuthFooter, AuthShell, GoogleLogo } from "@/app/components/AuthUi";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell>
      <div className="grid gap-7">
        <div>
          <h1 className="text-3xl font-black leading-tight text-[#352B24]">Kycu</h1>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[#6f5b4c]">
            Email
            <input
              type="email"
              name="email"
              required
              placeholder="emri@shembull.com"
              className="brand-focus h-12 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-medium text-[#352B24] shadow-sm"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#6f5b4c]">
            <span className="flex items-center justify-between">
              Fjalekalimi
              <Link href="/reset-password" className="text-xs font-bold text-[#D96C2D] hover:text-[#bf5520]">
                Harruat fjalekalimin?
              </Link>
            </span>
            <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="--------"
                className="brand-focus h-12 w-full rounded-xl border border-[#d9c7b8] bg-white px-4 pr-12 text-sm font-medium text-[#352B24] shadow-sm"
              />
              <button
                type="button"
                aria-label={showPassword ? "Fshih fjalekalimin" : "Shfaq fjalekalimin"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8a7565] transition hover:bg-[#FFF8F1] hover:text-[#D96C2D]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-xl bg-[#D96C2D] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(217,108,45,0.22)] transition hover:bg-[#bf5520] active:translate-y-px disabled:opacity-60"
          >
            {isPending ? "Duke ju identifikuar..." : "Hyni ne llogari"}
          </button>
        </form>

        <div className="grid gap-4">
          <AuthDivider>Ose vazhdo me</AuthDivider>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="brand-focus flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d9c7b8] bg-white px-4 text-sm font-black text-[#352B24] shadow-sm transition hover:border-[#D96C2D] hover:text-[#D96C2D] active:translate-y-px"
            >
              <GoogleLogo />
              Vazhdo me Google
            </button>
          </form>
        </div>

        <div className="border-t border-[#f0d9c4] pt-4 text-center text-xs text-[#6f5b4c]">
          Nuk keni ende llogari?{" "}
          <Link href="/register" className="font-black text-[#D96C2D] hover:text-[#bf5520]">
            Regjistrohu tani
          </Link>
        </div>

        <AuthFooter />
      </div>
    </AuthShell>
  );
}
