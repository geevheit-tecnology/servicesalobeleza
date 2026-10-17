// Utilitários de formatação inteligente para valores monetários e tempos

/**
 * Converte qualquer entrada (ex: "80", "80,50", "80.50", "R$ 80,00") em float puro
 */
export function parseCurrency(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  const cleaned = value
    .toString()
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata um valor numérico para exibição brasileira: R$ 80,00
 */
export function formatCurrency(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : parseCurrency(value);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(num);
}

/**
 * Formata minutos em texto amigável:
 * 30 -> "30 min"
 * 60 -> "1h"
 * 75 -> "1h 15min"
 * 90 -> "1h 30min"
 * 120 -> "2h"
 */
export function formatDurationDisplay(minutes: number | string | undefined | null): string {
  const total = typeof minutes === "number" ? minutes : parseDuration(minutes);
  if (!total || total <= 0) return "0 min";

  const h = Math.floor(total / 60);
  const m = total % 60;

  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

/**
 * Interpreta o que o usuário digitou para duração em minutos:
 * - "45" ou 45 -> 45
 * - "1h" ou "1 hr" -> 60
 * - "1:30" ou "1h30" ou "1h 30min" -> 90
 * - "2h" -> 120
 */
export function parseDuration(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 30;
  if (typeof val === "number") return isNaN(val) ? 30 : val;

  const str = val.toString().trim().toLowerCase();
  if (!str) return 30;

  // Formato "1:30" ou "01:30"
  if (str.includes(":")) {
    const parts = str.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  // Formato com "h" (ex: "1h30", "1h 30m", "1h", "2 hrs")
  if (str.includes("h")) {
    const parts = str.split("h");
    const h = parseInt(parts[0].replace(/\D/g, ""), 10) || 0;
    const m = parseInt(parts[1]?.replace(/\D/g, "") || "0", 10) || 0;
    return h * 60 + m;
  }

  // Se digitou apenas números (ex: "45", "60", "90")
  const numOnly = parseInt(str.replace(/\D/g, ""), 10);
  return isNaN(numOnly) ? 30 : numOnly;
}
