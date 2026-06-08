"use client";

import React, { useState, useTransition } from "react";
import { updateOrderAddress } from "@/app/actions/admin";
import { MapPin, CheckCircle, AlertCircle, Edit3, X } from "lucide-react";

interface OrderAddressFormProps {
  orderId: string;
  currentFullName: string;
  currentPhone: string;
  currentCountry?: string;
  currentCity: string;
  currentAddress: string;
}

export default function OrderAddressForm({
  orderId,
  currentFullName,
  currentPhone,
  currentCountry = "Albania",
  currentCity,
  currentAddress
}: OrderAddressFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentFullName);
  const [phone, setPhone] = useState(currentPhone);
  const [city, setCity] = useState(currentCity);
  const [address, setAddress] = useState(currentAddress);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await updateOrderAddress(orderId, fullName, phone, currentCountry, city, address);
      if (res.success) {
        setSuccess(res.message || "Adresa u perditesua!");
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Ndodhi nje gabim.");
      }
    });
  };

  return (
    <div className="w-full text-left">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2 text-emerald-400 text-xs mb-3 font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-2 text-red-500 text-xs mb-3 font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-slate-350 text-xs leading-relaxed">
              <span className="font-bold text-white text-sm">{fullName}</span>
              <span>Telefon: {phone}</span>
              <span>Qyteti: {city}</span>
              <span>Adresa: {address}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-white text-slate-400 transition-colors flex items-center gap-1.5 text-2xs uppercase tracking-wider font-extrabold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ndrysho</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 border-t border-slate-900 pt-4 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 text-2xs uppercase font-extrabold tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Perditeso Adresen e Dergimit</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-3xs uppercase font-semibold">Emri i plote i marresit</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-3xs uppercase font-semibold">Numri i telefonit</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-3xs uppercase font-semibold">Qyteti</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-3xs uppercase font-semibold">Rruga, Pallati, Hyrja (Adresa e plote)</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-200 text-xs focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-950">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 font-bold text-2xs uppercase transition-colors"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xs uppercase tracking-wider transition-colors shadow shadow-blue-500/10"
            >
              {isPending ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

