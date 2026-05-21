const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCOP(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return formatter.format(value);
}

export function formatCOPCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return "$" + compactFormatter.format(value);
}

export function parseCOPInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}
