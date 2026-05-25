"use client";

import React, { useState, useTransition } from "react";
import { switchSimulatedRole } from "@/app/actions/auth";
import { Shield, User, UserCheck, Eye, Terminal } from "lucide-react";

interface SandboxBannerProps {
  currentRole: string;
  isProdDbConnected: boolean;
}

export default function SandboxBanner({ currentRole, isProdDbConnected }: SandboxBannerProps) {
  const [activeRole, setActiveRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  if (isProdDbConnected) return null;

  const handleRoleSwitch = (role: string) => {
    setActiveRole(role);
    startTransition(async () => {
      await switchSimulatedRole(role);
    });
  };

  const roles = [
    { id: "guest", name: "Guest (Vizitor)", icon: Eye, color: "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30" },
    { id: "incomplete", name: "Incomplete Profile", icon: User, color: "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" },
    { id: "complete", name: "Complete Profile (Blerës)", icon: UserCheck, color: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" },
    { id: "admin", name: "Administrator (Admin)", icon: Shield, color: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2.5 px-4 sticky top-0 z-[9999] flex flex-wrap gap-3 items-center justify-between shadow-lg">
      <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wider">
        <Terminal className="w-4 h-4 text-amber-500 animate-pulse" />
        <span>Sandbox Mode: Simulo Rrolet</span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              disabled={isPending}
              onClick={() => handleRoleSwitch(role.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border font-medium ${
                isActive
                  ? "bg-amber-500 border-amber-600 text-slate-950 font-bold scale-105 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : `${role.color} border-transparent`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{role.name}</span>
            </button>
          );
        })}
      </div>

      <div className="text-slate-400 hidden lg:block text-right">
        {isPending ? (
          <span className="text-amber-500 font-medium">Duke ndryshuar sesionin...</span>
        ) : (
          <span>Klikoni për të parë platformën nga këndvështrime të ndryshme.</span>
        )}
      </div>
    </div>
  );
}
