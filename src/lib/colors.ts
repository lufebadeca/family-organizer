export const MEMBER_COLORS = [
  "#0ea5e9",
  "#a855f7",
  "#22c55e",
  "#f97316",
  "#ec4899",
  "#eab308",
  "#06b6d4",
  "#ef4444",
];

export const CATEGORY_COLORS = [
  "#0ea5e9",
  "#a855f7",
  "#22c55e",
  "#f97316",
  "#ec4899",
  "#eab308",
  "#06b6d4",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
];

export function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
