export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "1.19M" / "660k" — compact label cho matrix sticky col */
export function formatCompactVND(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const rounded = Math.round(millions * 100) / 100;
    const str = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return `${str}M`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return String(amount);
}

/** "20/05" */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "Thứ 4, 20/05/2026" */
export function formatLongDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Diff số đêm giữa start (incl) → end (excl) */
export function nightsBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00").getTime();
  const e = new Date(end + "T00:00:00").getTime();
  return Math.max(0, Math.round((e - s) / 86400000));
}

/** Thêm n ngày vào ISO date → ISO date */
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** ISO date của hôm nay (timezone local) */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "20 phút trước", "3 giờ trước", "hôm qua", "5 ngày trước" */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hôm qua";
  if (days < 30) return `${days} ngày trước`;
  return formatLongDate(iso.slice(0, 10));
}
