"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleAuctionAutoRelist } from "@/app/actions/admin";
import { RefreshCw } from "lucide-react";

export default function AutoRelistToggleForm({
  auctionId,
  enabled,
  disabled = false,
}: {
  auctionId: string;
  enabled: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const enabledInputRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(enabled);
  const [state, action, pending] = useActionState(async (_: unknown, formData: FormData) => {
    return toggleAuctionAutoRelist(
      String(formData.get("auctionId") || ""),
      String(formData.get("enabled") || "false") === "true"
    );
  }, null);

  useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [router, state?.success]);

  return (
    <form ref={formRef} action={action} className="grid gap-1.5">
      <input type="hidden" name="auctionId" value={auctionId} />
      <input ref={enabledInputRef} type="hidden" name="enabled" value={checked ? "true" : "false"} />
      <label className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-black ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#f0d9c4] bg-[#FFF8F1] text-[#8a7565]"}`}>
        <span className="inline-flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Auto 24h
        </span>
        <input
          type="checkbox"
          checked={checked}
          disabled={pending || disabled}
          onChange={(event) => {
            const nextChecked = event.target.checked;
            setChecked(nextChecked);
            if (enabledInputRef.current) enabledInputRef.current.value = nextChecked ? "true" : "false";
            requestAnimationFrame(() => formRef.current?.requestSubmit());
          }}
          className="h-4 w-4 accent-[#D96C2D]"
        />
      </label>
      {state?.error ? <p className="text-[11px] font-semibold text-red-700">{state.error}</p> : null}
    </form>
  );
}
