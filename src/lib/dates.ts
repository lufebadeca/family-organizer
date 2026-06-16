import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("es");

export { dayjs };

export type YearMonth = { year: number; month: number };

export function currentYearMonth(): YearMonth {
  const d = dayjs();
  return { year: d.year(), month: d.month() + 1 };
}

export function previousYearMonth({ year, month }: YearMonth): YearMonth {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function monthLabel({ year, month }: YearMonth): string {
  return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  return dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");
}

export function formatDueDate(date: string | null | undefined): string {
  if (!date) return "";
  const diff = daysUntil(date);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  if (diff != null && diff < 0) return `Hace ${Math.abs(diff)}d`;
  if (diff != null && diff <= 7) return `En ${diff}d`;
  return dayjs(date).format("D MMM");
}

export function yearMonthStart({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function isInYearMonth(date: string, ym: YearMonth): boolean {
  const d = dayjs(date);
  return d.year() === ym.year && d.month() + 1 === ym.month;
}

export function paymentDateForMonth(
  paymentDay: number,
  { year, month }: YearMonth,
): string {
  const lastDay = dayjs(`${year}-${String(month).padStart(2, "0")}-01`)
    .endOf("month")
    .date();
  const day = Math.min(paymentDay, lastDay);
  return dayjs(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`).format(
    "YYYY-MM-DD",
  );
}
