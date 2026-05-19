"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { dayStatus } from "@/lib/calendar";
import { addDays, formatShortDate } from "@/lib/format";

function formatVNDPlain(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
import { getPrimaryViewLabel } from "@/lib/amenities";

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
      isMonthStart: d.getDate() === 1 || i === 0,
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
      out.push({ label: `Tháng ${d.getMonth() + 1} ${d.getFullYear()}`, span: 1 });
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
  const dayInfos = buildDays(startDate, days, today);
  const months = groupByMonth(dayInfos);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [startDate]);

  useEffect(() => {
    const onJump = () => {
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    };
    window.addEventListener(MATRIX_JUMP_TODAY_EVENT, onJump);
    return () => window.removeEventListener(MATRIX_JUMP_TODAY_EVENT, onJump);
  }, []);

  return (
    <div className="matrix-root w-fit max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div ref={scrollRef} className="overflow-x-auto scrollbar-thin">
        <div className="w-fit">
          {/* Month band */}
          <div className="flex h-9 border-b border-neutral-200 bg-white">
            <div className="sticky left-0 z-20 flex w-[var(--prop-w)] shrink-0 items-end border-r border-neutral-200 bg-white px-3 pb-1.5 sm:px-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Căn hộ
              </span>
            </div>
            {months.map((g, idx) => (
              <div
                key={idx}
                className={
                  "flex shrink-0 items-end pb-1.5 " +
                  (idx > 0 ? "border-l border-l-neutral-200" : "")
                }
                style={{ width: `calc(var(--cell-w) * ${g.span})` }}
              >
                <span className="px-3 text-sm font-semibold text-neutral-900">
                  {g.label}
                </span>
              </div>
            ))}
            <div className="sticky right-0 z-20 flex w-[var(--price-w)] shrink-0 items-end justify-center border-l border-neutral-200 bg-white pb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Giá CTV / đêm
              </span>
            </div>
          </div>

          {/* Day-of-week + date header row */}
          <div className="flex h-12 border-b border-neutral-200 bg-white">
            <div className="sticky left-0 z-20 flex w-[var(--prop-w)] shrink-0 items-center justify-between border-r border-neutral-200 bg-white px-3 sm:px-4">
              <span className="text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-700 tnum">
                  {properties.length}
                </span>{" "}
                căn
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-300">
                Tuần
              </span>
            </div>
            {dayInfos.map((d) => (
              <DayHeader key={d.iso} info={d} />
            ))}
            <div className="sticky right-0 z-20 flex w-[var(--price-w)] shrink-0 border-l border-neutral-200 bg-white">
              <PriceColHeader label="Thường" />
              <PriceColHeader label="T6, T7" />
              <PriceColHeader label="Lễ" />
            </div>
          </div>

          {/* Property rows */}
          {properties.map((p) => (
            <MatrixRow key={p.id} property={p} days={dayInfos} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-700">
        <span className="font-semibold text-neutral-900">Chú thích:</span>
        <LegendItem status="avail" sampleDay={3} label="Trống — ngày thường" />
        <LegendItem
          status="avail-weekend"
          sampleDay={7}
          label="Trống — T6, T7"
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

function DayHeader({ info }: { info: DayInfo }) {
  if (info.isToday) {
    return (
      <div
        className={
          "flex shrink-0 flex-col items-center justify-center bg-neutral-900 text-white " +
          (info.isMonthStart ? "border-l border-l-neutral-200" : "")
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
      className={
        "flex shrink-0 flex-col items-center justify-center " +
        weekendTint +
        " " +
        (info.isMonthStart ? "border-l border-l-neutral-200 " : "")
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
    <div className="group/row flex border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50/40">
      <div className="sticky left-0 z-10 flex w-[var(--prop-w)] shrink-0 items-center gap-2 border-r border-neutral-200 bg-white px-2 py-1.5 transition-colors group-hover/row:bg-neutral-50 sm:gap-2.5 sm:px-2.5 sm:py-2">
        <Link
          href={`/property/${property.slug}`}
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:h-10 sm:w-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={property.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link
            href={`/property/${property.slug}`}
            className="block truncate text-[13px] font-semibold text-neutral-900 hover:underline"
          >
            {property.name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-neutral-500">
            {viewLabel && (
              <>
                <span className="font-medium text-emerald-700">{viewLabel}</span>
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
        </div>
        <FavoriteButton id={property.id} name={property.name} />
      </div>

      {days.map((d) => (
        <DayCell key={d.iso} info={d} property={property} />
      ))}

      <div className="sticky right-0 z-10 flex w-[var(--price-w)] shrink-0 border-l border-neutral-200 bg-white transition-colors group-hover/row:bg-neutral-50">
        <PriceCell value={ctvWeekday} bold />
        <PriceCell value={ctvWeekend} />
        <PriceCell value={ctvHoliday} />
      </div>
    </div>
  );
}

function DayCell({ info, property }: { info: DayInfo; property: Property }) {
  const status: CellStatus = info.isPast
    ? "past"
    : dayStatus(info.iso, property.bookings);
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
      title={`${formatShortDate(info.iso)} — ${property.name}: ${label}`}
      data-status={status}
      data-weekend={info.isWeekend ? "true" : undefined}
      data-today={info.isToday ? "true" : undefined}
      className={
        "day-cell shrink-0 " +
        (info.isMonthStart ? "border-l border-l-neutral-200" : "")
      }
      style={{ width: "var(--cell-w)" }}
    >
      {info.day}
    </div>
  );
}

function PriceColHeader({ label }: { label: string }) {
  return (
    <div
      className="flex items-end justify-center border-l border-neutral-100 pb-1.5 first:border-l-0"
      style={{ width: "var(--price-col)" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
    </div>
  );
}

function PriceCell({
  value,
  bold = false,
}: {
  value: number | null;
  bold?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center border-l border-neutral-100 px-1 py-2 first:border-l-0"
      style={{ width: "var(--price-col)" }}
    >
      {value !== null ? (
        <span
          className={
            "tnum whitespace-nowrap text-center " +
            (bold
              ? "text-[12px] font-semibold text-neutral-900"
              : "text-[11px] font-medium text-neutral-700")
          }
        >
          {formatVNDPlain(value)}
          <span className="ml-0.5 text-[9px] font-normal text-neutral-400">
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
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setActive((v) => !v);
      }}
      className="heart-btn"
      data-active={active}
      aria-label={active ? `Bỏ yêu thích ${name}` : `Yêu thích ${name}`}
      aria-pressed={active}
      data-id={id}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill={active ? "currentColor" : "none"}
        aria-hidden
      >
        <path
          d="M10 17s-6.5-3.6-6.5-8.2A3.3 3.3 0 0 1 10 6a3.3 3.3 0 0 1 6.5 2.8C16.5 13.4 10 17 10 17z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
