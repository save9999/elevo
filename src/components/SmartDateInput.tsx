"use client";
import { useRef, useState } from "react";

interface SmartDateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void; // retourne YYYY-MM-DD
  className?: string;
}

export default function SmartDateInput({ value, onChange, className }: SmartDateInputProps) {
  // Parse YYYY-MM-DD → DD, MM, YYYY
  const [d, m, y] = value
    ? [value.slice(8, 10), value.slice(5, 7), value.slice(0, 4)]
    : ["", "", ""];

  const [day, setDay] = useState(d);
  const [month, setMonth] = useState(m);
  const [year, setYear] = useState(y);

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  function emit(dd: string, mm: string, yyyy: string) {
    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
      onChange(`${yyyy}-${mm}-${dd}`);
    }
  }

  function handleDay(v: string) {
    const clean = v.replace(/\D/g, "").slice(0, 2);
    setDay(clean);
    emit(clean, month, year);
    if (clean.length === 2) {
      // Auto-avance vers mois
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  }

  function handleMonth(v: string) {
    const clean = v.replace(/\D/g, "").slice(0, 2);
    setMonth(clean);
    emit(day, clean, year);
    if (clean.length === 2) {
      // Auto-avance vers année
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  }

  function handleYear(v: string) {
    const clean = v.replace(/\D/g, "").slice(0, 4);
    setYear(clean);
    emit(day, month, clean);
  }

  const inputBase = `text-center font-black text-slate-800 bg-transparent outline-none border-b-2 transition-colors ${className || ""}`;

  return (
    <div
      className="flex items-center gap-1 w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-violet-400 transition-colors"
      style={{ background: "white" }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="JJ"
        value={day}
        onChange={(e) => handleDay(e.target.value)}
        maxLength={2}
        className={`${inputBase} w-8 border-slate-200 focus:border-violet-400`}
      />
      <span className="text-slate-400 font-bold">/</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={month}
        onChange={(e) => handleMonth(e.target.value)}
        maxLength={2}
        className={`${inputBase} w-8 border-slate-200 focus:border-violet-400`}
      />
      <span className="text-slate-400 font-bold">/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="AAAA"
        value={year}
        onChange={(e) => handleYear(e.target.value)}
        maxLength={4}
        className={`${inputBase} w-14 border-slate-200 focus:border-violet-400`}
      />
      <span className="ml-auto text-xs text-slate-400">📅</span>
    </div>
  );
}
