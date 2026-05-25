"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endTime: string;
  onEnd?: () => void;
}

export default function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft("Mbyllur");
        setIsEnded(true);
        if (onEnd) onEnd();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Warning when under 1 hour
      if (difference < 1000 * 60 * 60) {
        setIsEndingSoon(true);
      } else {
        setIsEndingSoon(false);
      }

      let format = "";
      if (days > 0) format += `${days}d `;
      if (hours > 0 || days > 0) format += `${hours}h `;
      format += `${minutes}m ${seconds}s`;

      setTimeLeft(format);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (isEnded) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-semibold text-xs uppercase border border-slate-700">
        Mbyllur
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider border transition-all ${
        isEndingSoon
          ? "bg-red-500/10 border-red-500/30 text-red-500 glow-badge-amber animate-pulse"
          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
}
