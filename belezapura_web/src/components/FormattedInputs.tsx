import type { InputHTMLAttributes } from "react";
import { parseCurrency } from "@/utils/formatters";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
};

// Preserve decimal typing and apply BRL formatting when leaving the field.
export function CurrencyInput({ value, onValueChange, className = "", onBlur, ...props }: Props) {
  return <div className="relative min-w-0">
    <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
    <input {...props} type="text" inputMode="decimal" value={value}
      onChange={e => onValueChange(e.target.value.replace(/[^\d.,]/g, ""))}
      onBlur={e => {
        if (value.trim()) onValueChange(parseCurrency(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        onBlur?.(e);
      }} className={`w-full min-w-0 ${className} pl-10`} />
  </div>;
}

// A time control supplies the separator and native picker; no “h” suffix to type.
export function DurationInput({ value, onValueChange, className = "", ...props }: Props) {
  return <input {...props} type="time" step={60} min="00:01" max="23:59" value={value}
    onChange={e => onValueChange(e.target.value)} className={`w-full min-w-0 ${className}`} />;
}

export function durationTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
