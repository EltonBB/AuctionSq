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
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-2 text-emerald-700 text-xs mb-3 font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-center gap-2 text-red-700 text-xs mb-3 font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-[#6f5a4b] text-xs leading-relaxed">
              <span className="font-bold text-[#352B24] text-sm">{fullName}</span>
              <span>Telefon: {phone}</span>
              <span>Qyteti: {city}</span>
              <span>Adresa: {address}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-white hover:bg-[#fff7ed] border border-[#efcfb5] text-[#df6b2e] transition-colors flex items-center gap-1.5 text-2xs uppercase tracking-wider font-extrabold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ndrysho</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 border-t border-[#f0d9c4] pt-4 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-[#df6b2e] text-2xs uppercase font-extrabold tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#df6b2e]" />
              <span>Perditeso Adresen e Dergimit</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded bg-white hover:bg-[#fff7ed] border border-[#efcfb5] text-[#9b7b66] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7c614f] text-3xs uppercase font-semibold">Emri i plote i marresit</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-white border border-[#efcfb5] text-[#352B24] text-xs focus:border-[#df6b2e] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#7c614f] text-3xs uppercase font-semibold">Numri i telefonit</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-white border border-[#efcfb5] text-[#352B24] text-xs focus:border-[#df6b2e] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#7c614f] text-3xs uppercase font-semibold">Qyteti</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-white border border-[#efcfb5] text-[#352B24] text-xs focus:border-[#df6b2e] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#7c614f] text-3xs uppercase font-semibold">Rruga, Pallati, Hyrja (Adresa e plote)</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-white border border-[#efcfb5] text-[#352B24] text-xs focus:border-[#df6b2e] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#f0d9c4]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-white border border-[#efcfb5] hover:bg-[#fff7ed] text-[#7c614f] font-bold text-2xs uppercase transition-colors"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-lg bg-[#df6b2e] hover:bg-[#c85f28] text-white font-bold text-2xs uppercase tracking-wider transition-colors"
            >
              {isPending ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

