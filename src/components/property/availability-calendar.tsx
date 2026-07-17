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
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 lg:gap-4">
        {months.map((month) => (
          <article
            key={`${month.year}-${month.month}`}
            className="w-[82vw] max-w-[320px] shrink-0 snap-center rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:w-auto sm:max-w-none"
          >
            <h3 className="mb-3 text-sm font-bold tracking-tight text-neutral-900">
              {month.label}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
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
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-neutral-200/70 bg-white/70 px-3.5 py-3 text-[11px] font-semibold text-neutral-500">
        <Legend status="avail" label="Còn trống" />
        <Legend status="hold" label="Đang giữ" />
        <Legend status="booked" label="Đã đặt" />
        <span className="w-full text-neutral-400 sm:hidden">Vuốt ngang để xem tháng tiếp theo</span>
      </div>
    </div>
  );
}

function Legend({ status, label }: { status: "avail" | "hold" | "booked"; label: string }) {
  const color =
    status === "avail"
      ? "bg-emerald-50 ring-emerald-200"
      : status === "hold"
        ? "bg-amber-50 ring-amber-200"
        : "bg-rose-50 ring-rose-200";

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-[4px] ring-1 ring-inset ${color}`} aria-hidden />
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
  let cls = "flex h-full w-full items-center justify-center rounded-lg text-[13px] font-semibold tabular-nums transition-colors ";
  if (isPast) {
    cls += "bg-neutral-50 text-neutral-300";
  } else if (status === "booked") {
    cls += "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 line-through decoration-1";
  } else if (status === "hold") {
    cls += "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
  } else {
    cls += "bg-emerald-50/70 text-emerald-800 ring-1 ring-inset ring-emerald-100";
  }
  if (isToday) cls += " !ring-2 !ring-teal-700";

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
