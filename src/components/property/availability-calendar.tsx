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
    cls += "bg-[var(--color-booked-bg)] text-[var(--color-booked-fg)] line-through decoration-1";
  } else if (status === "hold") {
    cls += "bg-[var(--color-hold-bg)] text-[var(--color-hold-fg)]";
  } else {
    cls += "bg-white text-neutral-900 ring-1 ring-inset ring-neutral-200";
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
