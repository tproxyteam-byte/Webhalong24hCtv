import type { BookingBlock } from "@/lib/types";
import { dayStatus, next3Months } from "@/lib/calendar";

interface AvailabilityCalendarProps {
  bookings: readonly BookingBlock[];
  /** ISO date hôm nay — ô < today sẽ bị muted */
  today: string;
}

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function AvailabilityCalendar({
  bookings,
  today,
}: AvailabilityCalendarProps) {
  const months = next3Months(today);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-neutral-600">
        <CalendarLegend color="bg-emerald-500" label="Còn trống" />
        <CalendarLegend color="bg-amber-400" label="Đang giữ chỗ" />
        <CalendarLegend color="bg-rose-500" label="Đã đặt" />
        <CalendarLegend color="bg-neutral-300" label="Đã qua" />
      </div>
      <div className="grid gap-5 md:grid-cols-3 md:gap-4">
      {months.map((month) => (
        <div
          key={`${month.year}-${month.month}`}
          className="rounded-xl border border-neutral-200 bg-white p-4"
        >
          <h3 className="mb-3 text-sm font-semibold tracking-tight text-neutral-900">
            {month.label}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {month.weeks.flat().map((cell, idx) => {
              if (!cell.inMonth) {
                return <div key={idx} className="aspect-square" aria-hidden />;
              }
              const isPast = cell.iso < today;
              const status = dayStatus(cell.iso, bookings);
              const isToday = cell.iso === today;
              return (
                <div key={idx} className="aspect-square">
                  <CalendarDay
                    day={cell.day}
                    isPast={isPast}
                    isToday={isToday}
                    status={status}
                    iso={cell.iso}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

function CalendarLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}

function CalendarDay({
  day,
  isPast,
  isToday,
  status,
  iso,
}: {
  day: number;
  isPast: boolean;
  isToday: boolean;
  status: "avail" | "hold" | "booked";
  iso: string;
}) {
  let cls = "flex h-full w-full items-center justify-center rounded-md text-sm font-medium ";
  if (isPast) {
    cls += "bg-neutral-50 text-neutral-300";
  } else if (status === "booked") {
    cls += "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 line-through decoration-1";
  } else if (status === "hold") {
    cls += "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200";
  } else {
    cls += "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200";
  }
  if (isToday) cls += " !ring-2 !ring-neutral-900";

  const statusLabel = isPast
    ? "đã qua"
    : status === "avail"
      ? "trống"
      : status === "hold"
        ? "đang giữ chỗ"
        : "đã đặt";

  return (
    <div className={cls} aria-label={`${iso} — ${statusLabel}`}>
      {day}
    </div>
  );
}
