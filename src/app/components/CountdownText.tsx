"use client";

import { useEffect, useState } from "react";

interface CountdownTextProps {
  endTime: string;
  showSeconds?: boolean;
}

function formatRemaining(endTime: string, now: number, showSeconds: boolean) {
  const diff = Math.max(0, new Date(endTime).getTime() - now);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  if (showSeconds) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m`;
}

export default function CountdownText({ endTime, showSeconds = false }: CountdownTextProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), showSeconds ? 1000 : 60000);
    return () => window.clearInterval(interval);
  }, [showSeconds]);

  if (now === null) {
    return <span>...</span>;
  }

  return <span>{formatRemaining(endTime, now, showSeconds)}</span>;
}
