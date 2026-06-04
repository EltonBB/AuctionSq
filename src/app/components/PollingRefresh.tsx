"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PollingRefreshProps {
  intervalMs?: number;
}

export default function PollingRefresh({ intervalMs = 15000 }: PollingRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}

