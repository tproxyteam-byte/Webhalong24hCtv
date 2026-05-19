import type { BookingBlock, DayStatus, PropertyPricing } from "./types";
import { addDays } from "./format";

/** Trạng thái 1 ngày trong calendar dựa trên list bookings */
export function dayStatus(iso: string, bookings: readonly BookingBlock[]): DayStatus {
  for (const b of bookings) {
    if (iso >= b.start && iso < b.end) {
      return b.status;
    }
  }
  return "avail";
}

/** Tính giá CTV cho 1 đêm (đã trừ chiết khấu) — Fri/Sat = weekend */
export function ctvPricePerNight(iso: string, pricing: PropertyPricing): number {
  const day = new Date(iso + "T00:00:00").getDay(); // 0=CN
  const base = day === 5 || day === 6 ? pricing.weekend : pricing.weekday;
  return Math.round(base * (1 - pricing.ctvDiscount));
}

/** Giá CTV tối thiểu trong 30 ngày tới — dùng cho card */
export function minCtvPriceNext30Days(
  pricing: PropertyPricing,
  startIso: string,
): number {
  let min = Infinity;
  for (let i = 0; i < 30; i += 1) {
    const iso = addDays(startIso, i);
    const p = ctvPricePerNight(iso, pricing);
    if (p < min) min = p;
  }
  return min;
}

/** Đếm số đêm còn trống trong N ngày kế tiếp */
export function countAvailableNights(
  bookings: readonly BookingBlock[],
  startIso: string,
  days: number,
): number {
  let count = 0;
  for (let i = 0; i < days; i += 1) {
    if (dayStatus(addDays(startIso, i), bookings) === "avail") count += 1;
  }
  return count;
}

/** Có trống ít nhất 1 đêm trong khoảng [from, to) không? */
export function hasAvailabilityInRange(
  bookings: readonly BookingBlock[],
  from: string,
  to: string,
): boolean {
  let cursor = from;
  while (cursor < to) {
    if (dayStatus(cursor, bookings) === "avail") return true;
    cursor = addDays(cursor, 1);
  }
  return false;
}

/** Trống TOÀN BỘ các đêm trong [from, to) — dùng khi sale chọn check-in/check-out cụ thể */
export function isFullyAvailableInRange(
  bookings: readonly BookingBlock[],
  from: string,
  to: string,
): boolean {
  if (from >= to) return false;
  let cursor = from;
  while (cursor < to) {
    if (dayStatus(cursor, bookings) !== "avail") return false;
    cursor = addDays(cursor, 1);
  }
  return true;
}

export interface MonthMatrix {
  /** "Tháng 5 2026" */
  label: string;
  year: number;
  /** 0-indexed (0=Jan) */
  month: number;
  /** 6 hàng × 7 cột — null = ô lề tháng khác */
  weeks: Array<Array<{ iso: string; day: number; inMonth: boolean }>>;
}

/** Sinh matrix tuần (Mon→Sun) cho tháng, padding ngày tháng trước/sau */
export function buildMonthMatrix(year: number, month: number): MonthMatrix {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Vietnam tuần bắt đầu Thứ 2 — JS getDay: 0=CN, 1=T2,...
  const startWeekday = (first.getDay() + 6) % 7; // T2=0,...,CN=6
  const totalCells = Math.ceil((startWeekday + last.getDate()) / 7) * 7;
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayOffset = i - startWeekday;
    const d = new Date(year, month, 1 + dayOffset);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    });
  }

  const weeks: MonthMatrix["weeks"] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return {
    label: `Tháng ${month + 1} ${year}`,
    year,
    month,
    weeks,
  };
}

export type DatePreset =
  | "any"
  | "weekend-this"
  | "weekend-next"
  | "week-this"
  | "week-next";

export interface DateRange {
  from: string;
  to: string;
  label: string;
}

/** Cuối tuần này (T6 + T7). Nếu hôm nay là T7 thì giữ T7 và CN của tuần này. */
function thisWeekendRange(today: string): { from: string; to: string } {
  const d = new Date(today + "T00:00:00");
  const dow = d.getDay();
  let daysToFri = (5 - dow + 7) % 7;
  if (daysToFri === 0 && dow === 6) daysToFri = -1;
  const fri = addDays(today, daysToFri);
  return { from: fri, to: addDays(fri, 2) };
}

/** T2 → T2 tuần kế tiếp (tuần này = từ today đến CN tuần này, end exclusive = T2 tuần sau) */
function thisWeekRange(today: string): { from: string; to: string } {
  const d = new Date(today + "T00:00:00");
  const dow = d.getDay();
  const daysToMon = dow === 0 ? 1 : 8 - dow;
  return { from: today, to: addDays(today, daysToMon) };
}

/** Resolve preset thành range hoặc null nếu "any" */
export function resolveDatePreset(
  preset: DatePreset,
  today: string,
): DateRange | null {
  if (preset === "any") return null;
  if (preset === "weekend-this") {
    const r = thisWeekendRange(today);
    return { ...r, label: "Cuối tuần này" };
  }
  if (preset === "weekend-next") {
    const w = thisWeekendRange(today);
    return {
      from: addDays(w.from, 7),
      to: addDays(w.to, 7),
      label: "Cuối tuần tới",
    };
  }
  if (preset === "week-this") {
    return { ...thisWeekRange(today), label: "Tuần này" };
  }
  if (preset === "week-next") {
    const w = thisWeekRange(today);
    return {
      from: w.to,
      to: addDays(w.to, 7),
      label: "Tuần sau",
    };
  }
  return null;
}

/** 3 tháng kế tiếp bắt đầu từ tháng chứa startIso */
export function next3Months(startIso: string): MonthMatrix[] {
  const start = new Date(startIso + "T00:00:00");
  const out: MonthMatrix[] = [];
  for (let i = 0; i < 3; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    out.push(buildMonthMatrix(d.getFullYear(), d.getMonth()));
  }
  return out;
}
