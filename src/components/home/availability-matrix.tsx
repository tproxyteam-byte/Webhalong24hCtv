"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { dayStatus } from "@/lib/calendar";
import { addDays, formatShortDate, formatCompactVND } from "@/lib/format";

function formatVNDPlain(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
import { getPrimaryViewLabel } from "@/lib/amenities";
import { useFavorites } from "@/hooks/use-favorites";

export const MATRIX_JUMP_TODAY_EVENT = "websale:matrix-jump-today";

type CellStatus = "past" | "avail" | "hold" | "booked";

interface DayInfo {
  iso: string;
  day: number;
  /** 0=CN, 1=T2, ..., 6=T7 (JS Date.getDay) */
  dow: number;
  isWeekend: boolean;
  isMonthStart: boolean;
  isPast: boolean;
  isToday: boolean;
}

interface MonthGroup {
  label: string;
  span: number;
}

const DOW_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function buildDays(startIso: string, count: number, todayIso: string): DayInfo[] {
  const out: DayInfo[] = [];
  for (let i = 0; i < count; i += 1) {
    const iso = addDays(startIso, i);
    const d = new Date(iso + "T00:00:00");
    const dow = d.getDay();
    out.push({
      iso,
      day: d.getDate(),
      dow,
      isWeekend: dow === 5 || dow === 6,
      isMonthStart: d.getDate() === 1,
      isPast: iso < todayIso,
      isToday: iso === todayIso,
    });
  }
  return out;
}

function groupByMonth(days: DayInfo[]): MonthGroup[] {
  const out: MonthGroup[] = [];
  let curKey = "";
  for (const info of days) {
    const d = new Date(info.iso + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key !== curKey) {
      curKey = key;
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      out.push({ label: `${monthStr}-${d.getFullYear()}`, span: 1 });
    } else {
      out[out.length - 1].span += 1;
    }
  }
  return out;
}

interface AvailabilityMatrixProps {
  properties: Property[];
  today: string;
  /** ISO ngày matrix bắt đầu — mặc định = today, có thể đổi qua MatrixDatePicker */
  startDate: string;
  /** Số ngày hiển thị */
  days?: number;
}

export function AvailabilityMatrix({
  properties,
  today,
  startDate,
  days = 30,
}: AvailabilityMatrixProps) {
  // Shift the actual rendering start date back by 7 days to allow backward scrolling
  const renderStartDate = addDays(startDate, -7);
  const renderDays = days + 7;
  const dayInfos = buildDays(renderStartDate, renderDays, today);
  const months = groupByMonth(dayInfos);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const getStartScrollLeft = () => {
    if (!scrollRef.current) return 0;
    const startCell = scrollRef.current.querySelector('[data-start-date="true"]') as HTMLElement;
    if (!startCell) return 0;
    const stickyCol = scrollRef.current.querySelector('.sticky.left-0') as HTMLElement;
    const stickyWidth = stickyCol ? stickyCol.offsetWidth : 0;
    return Math.max(0, startCell.offsetLeft - stickyWidth);
  };

  useEffect(() => {
    const timerInit = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "auto";
        scrollRef.current.scrollLeft = getStartScrollLeft();
      }
    }, 0);

    // Perform a subtle scroll bounce animation to show scrollability
    const timer1 = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "smooth";
        scrollRef.current.scrollLeft = getStartScrollLeft() + 60; // scroll right
      }
    }, 450);

    const timer2 = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = getStartScrollLeft(); // scroll back
      }
    }, 1150);

    return () => {
      clearTimeout(timerInit);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [startDate]);

  useEffect(() => {
    const onJump = () => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "smooth";
        scrollRef.current.scrollLeft = getStartScrollLeft();
      }
    };
    window.addEventListener(MATRIX_JUMP_TODAY_EVENT, onJump);
    return () => window.removeEventListener(MATRIX_JUMP_TODAY_EVENT, onJump);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest("svg") ||
      target.closest("path")
    ) {
      return;
    }

    setIsDragging(true);
    if (scrollRef.current) {
      dragStart.current = {
        x: e.pageX,
        scrollLeft: scrollRef.current.scrollLeft,
      };
      scrollRef.current.style.cursor = "grabbing";
      scrollRef.current.style.scrollBehavior = "auto";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - dragStart.current.x) * 1.5; // speed factor
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.scrollBehavior = "smooth";
    }
  };

  return (
    <div className="matrix-root w-fit max-w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-thin cursor-grab select-none active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <div className="w-fit">
          {/* Month band */}
          <div className="flex h-9 border-b border-neutral-200 bg-neutral-50/80">
            <div className="sticky left-0 z-20 flex w-[var(--prop-w)] shrink-0 items-end border-r border-neutral-200 bg-neutral-50 px-3 pb-1.5 sm:px-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Căn hộ
              </span>
            </div>
            {months.map((g, idx) => (
              <div
                key={idx}
                className={
                  "flex shrink-0 items-end pb-1.5 " +
                  (idx > 0 ? "border-l-2 border-l-neutral-800" : "")
                }
                style={{ width: `calc(var(--cell-w) * ${g.span})` }}
              >
                <span className="px-3 text-xs font-bold uppercase tracking-wider text-neutral-600 whitespace-nowrap">
                  {g.label}
                </span>
              </div>
            ))}
            <div className="hidden sm:flex sticky right-0 z-20 w-[var(--price-w)] shrink-0 items-end justify-center border-l border-neutral-200 bg-neutral-50 pb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                Giá CTV / đêm
              </span>
            </div>
          </div>

          {/* Day-of-week + date header row */}
          <div className="flex h-12 border-b border-neutral-200 bg-neutral-50/50">
            <div className="sticky left-0 z-20 flex w-[var(--prop-w)] shrink-0 items-center justify-between border-r border-neutral-200 bg-neutral-50 px-3 sm:px-4">
              <span className="text-[11px] text-neutral-400 font-medium">
                <span className="font-bold text-teal-700 tnum">
                  {properties.length}
                </span>{" "}
                căn
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                Tuần
              </span>
            </div>
            {dayInfos.map((d) => (
              <DayHeader key={d.iso} info={d} isSelectedStart={d.iso === startDate} />
            ))}
            <div className="hidden sm:flex sticky right-0 z-20 w-[var(--price-w)] shrink-0 border-l border-neutral-200 bg-neutral-50">
              <PriceColHeader label="Thường" type="weekday" />
              <PriceColHeader label="T6, T7" type="weekend" />
              <PriceColHeader label="Lễ" type="holiday" />
            </div>
          </div>

          {/* Property rows */}
          {properties.map((p) => (
            <MatrixRow key={p.id} property={p} days={dayInfos} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-200/80 bg-neutral-50/60 px-4 py-3.5 text-xs text-neutral-600">
        <span className="font-bold text-neutral-800">Chú thích:</span>
        <LegendItem status="avail" sampleDay={3} label="Trống ngày thường" />
        <LegendItem
          status="avail-weekend"
          sampleDay={7}
          label="Trống T6, T7"
        />
        <LegendItem status="hold" sampleDay={12} label="Đang giữ chỗ" />
        <LegendItem status="booked" sampleDay={15} label="Đã đặt" />
        <LegendItem status="past" sampleDay={1} label="Đã qua" />
      </div>
    </div>
  );
}

function LegendItem({
  status,
  sampleDay,
  label,
}: {
  status: "avail" | "avail-weekend" | "hold" | "booked" | "past" | "maintenance";
  sampleDay: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="legend-swatch" data-status={status}>
        {sampleDay}
      </span>
      <span>{label}</span>
    </span>
  );
}

function DayHeader({
  info,
  isSelectedStart,
}: {
  info: DayInfo;
  isSelectedStart: boolean;
}) {
  if (info.isToday) {
    return (
      <div
        data-today="true"
        data-start-date={isSelectedStart ? "true" : undefined}
        className={
          "flex shrink-0 flex-col items-center justify-center bg-neutral-900 text-white " +
          (info.isMonthStart ? "border-l-2 border-l-neutral-800" : "")
        }
        style={{ width: "var(--cell-w)" }}
      >
        <span className="text-[10px] font-medium uppercase leading-none tracking-wider text-neutral-300">
          {DOW_LABELS[info.dow]}
        </span>
        <span className="mt-0.5 text-sm font-semibold leading-none tnum">
          {info.day}
        </span>
      </div>
    );
  }
  const weekendTint = info.isWeekend ? "bg-[#ecfdf5]" : "";
  return (
    <div
      data-start-date={isSelectedStart ? "true" : undefined}
      className={
        "flex shrink-0 flex-col items-center justify-center " +
        weekendTint +
        " " +
        (info.isMonthStart ? "border-l-2 border-l-neutral-800 " : "")
      }
      style={{ width: "var(--cell-w)" }}
    >
      <span
        className={
          "text-[10px] font-medium uppercase leading-none tracking-wider " +
          (info.isWeekend ? "text-emerald-700" : "text-neutral-400")
        }
      >
        {DOW_LABELS[info.dow]}
      </span>
      <span
        className={
          "mt-0.5 text-sm font-semibold leading-none tnum " +
          (info.isWeekend ? "text-emerald-900" : "text-neutral-900")
        }
      >
        {info.day}
      </span>
    </div>
  );
}

function MatrixRow({
  property,
  days,
}: {
  property: Property;
  days: DayInfo[];
}) {
  const cover = property.images[0];
  const viewLabel = getPrimaryViewLabel(property.amenities);
  const factor = 1 - property.pricing.ctvDiscount;
  const ctvWeekday = Math.round(property.pricing.weekday * factor);
  const ctvWeekend = Math.round(property.pricing.weekend * factor);
  const ctvHoliday = property.pricing.holiday
    ? Math.round(property.pricing.holiday * factor)
    : null;

  return (
    <div className="group/row flex border-b border-neutral-100 last:border-b-0 hover:bg-accent-50">
      <div className="sticky left-0 z-10 flex w-[var(--prop-w)] shrink-0 items-center gap-2 border-r border-neutral-200 bg-white px-2 py-1.5 transition-colors group-hover/row:bg-accent-50 sm:gap-2.5 sm:px-2.5 sm:py-2">
        <Link
          href={`/property/${property.slug}`}
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:h-10 sm:w-10 ring-1 ring-neutral-200/50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/row:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link
            href={`/property/${property.slug}`}
            className="block truncate text-[13px] font-semibold text-neutral-800 hover:text-teal-700 hover:underline"
          >
            {property.name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-neutral-500 font-medium">
            {viewLabel && (
              <>
                <span className="font-semibold text-teal-600">{viewLabel}</span>
                <span className="text-neutral-300">·</span>
              </>
            )}
            <span>
              {property.bedrooms === 0 ? "Studio" : `${property.bedrooms}PN`}
              <span className="mx-1 text-neutral-300">·</span>
              {property.floorArea}m²
              <span className="mx-1 text-neutral-300">·</span>
              {property.maxGuests}k
            </span>
          </p>
          <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
            <span className="inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-800">
              {formatCompactVND(ctvWeekday)}
            </span>
            <span className="inline-flex items-center rounded bg-teal-50 px-1 py-0.5 text-[9px] font-bold text-teal-700 border border-teal-100/50">
              {formatCompactVND(ctvWeekend)}
            </span>
            {ctvHoliday && (
              <span className="inline-flex items-center rounded bg-rose-50 px-1 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-100/50">
                {formatCompactVND(ctvHoliday)}
              </span>
            )}
          </div>
        </div>
        <FavoriteButton id={property.id} name={property.name} />
      </div>

      {days.map((d) => (
        <DayCell key={d.iso} info={d} property={property} />
      ))}

      <div className="hidden sm:flex sticky right-0 z-10 w-[var(--price-w)] shrink-0 border-l border-neutral-200 bg-white transition-colors group-hover/row:bg-accent-50">
        <PriceCell value={ctvWeekday} type="weekday" />
        <PriceCell value={ctvWeekend} type="weekend" />
        <PriceCell value={ctvHoliday} type="holiday" />
      </div>
    </div>
  );
}

function DayCell({ info, property }: { info: DayInfo; property: Property }) {
  const realStatus = dayStatus(info.iso, property.bookings);
  const status: CellStatus = info.isPast
    ? realStatus === "booked" || realStatus === "hold"
      ? realStatus
      : "past"
    : realStatus;

  const label =
    status === "past"
      ? "đã qua"
      : status === "avail"
        ? info.isWeekend
          ? "trống · cuối tuần"
          : "trống"
        : status === "hold"
          ? "đang giữ chỗ"
          : "đã đặt";

  return (
    <div
      title={`${formatShortDate(info.iso)} — ${property.name}: ${label}${info.isPast ? " (đã qua)" : ""}`}
      data-status={status}
      data-weekend={info.isWeekend ? "true" : undefined}
      data-today={info.isToday ? "true" : undefined}
      data-past={info.isPast ? "true" : undefined}
      className={
        "day-cell shrink-0 " +
        (info.isMonthStart ? "border-l-2 border-l-neutral-800" : "")
      }
      style={{ width: "var(--cell-w)" }}
    >
      {info.day}
    </div>
  );
}

function PriceColHeader({
  label,
  type,
}: {
  label: string;
  type: "weekday" | "weekend" | "holiday";
}) {
  let colorClass = "text-neutral-500";
  if (type === "weekend") {
    colorClass = "text-teal-700";
  } else if (type === "holiday") {
    colorClass = "text-rose-600";
  }
  return (
    <div
      className="flex items-end justify-center border-l border-neutral-100 pb-1.5 first:border-l-0"
      style={{ width: "var(--price-col)" }}
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
        {label}
      </span>
    </div>
  );
}

function PriceCell({
  value,
  type,
}: {
  value: number | null;
  type: "weekday" | "weekend" | "holiday";
}) {
  let colorClass = "";
  if (type === "weekday") {
    colorClass = "text-slate-900 font-bold text-[12.5px] sm:text-[13px]";
  } else if (type === "weekend") {
    colorClass = "text-teal-700 font-extrabold text-[12.5px] sm:text-[13px]";
  } else if (type === "holiday") {
    colorClass = "text-rose-600 font-extrabold text-[12.5px] sm:text-[13px]";
  }

  return (
    <div
      className="flex items-center justify-center border-l border-neutral-100 px-1 py-2 first:border-l-0"
      style={{ width: "var(--price-col)" }}
    >
      {value !== null ? (
        <span className={`tnum whitespace-nowrap text-center ${colorClass}`}>
          {formatVNDPlain(value)}
          <span className="ml-0.5 text-[9.5px] font-medium opacity-70">
            đ
          </span>
        </span>
      ) : (
        <span className="text-xs text-neutral-300">—</span>
      )}
    </div>
  );
}

function FavoriteButton({ id, name }: { id: string; name: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
      }}
      className="heart-btn transition-transform active:scale-95 cursor-pointer"
      data-active={active}
      aria-label={active ? `Bỏ yêu thích ${name}` : `Yêu thích ${name}`}
      aria-pressed={active}
      data-id={id}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill={active ? "var(--color-booked-fg)" : "none"}
        stroke={active ? "var(--color-booked-fg)" : "currentColor"}
        aria-hidden
        className="transition-colors duration-200"
      >
        <path
          d="M10 17s-6.5-3.6-6.5-8.2A3.3 3.3 0 0 1 10 6a3.3 3.3 0 0 1 6.5 2.8C16.5 13.4 10 17 10 17z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
