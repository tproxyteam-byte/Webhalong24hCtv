"use client";

import { useEffect, useRef, useState } from "react";
import { buildMonthMatrix } from "@/lib/calendar";
import { formatShortDate } from "@/lib/format";

interface MatrixDatePickerProps {
  value: string;
  today: string;
  onChange: (iso: string) => void;
}

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function MatrixDatePicker({
  value,
  today,
  onChange,
}: MatrixDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [view, setView] = useState(() => {
    const d = new Date((value || today) + "T00:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const matrix = buildMonthMatrix(view.year, view.month);
  const todayMonthIdx =
    new Date(today + "T00:00:00").getFullYear() * 12 +
    new Date(today + "T00:00:00").getMonth();
  const viewMonthIdx = view.year * 12 + view.month;
  const canGoBack = viewMonthIdx > todayMonthIdx;

  const goPrev = () => {
    if (!canGoBack) return;
    setView((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const goNext = () =>
    setView((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isToday = value === today;
  const buttonLabel = isToday ? "Hôm nay" : `Từ ${formatShortDate(value)}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors " +
          (isToday
            ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
            : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800")
        }
      >
        <CalendarIcon />
        {buttonLabel}
        <svg
          aria-hidden
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={"transition-transform " + (open ? "rotate-180" : "")}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="animate-popover absolute right-0 top-full z-40 mt-1.5 w-[296px] rounded-lg border border-neutral-200 bg-white p-3 shadow-[var(--shadow-pop)]">
          {/* Month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoBack}
              aria-label="Tháng trước"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ‹
            </button>
            <span className="text-sm font-semibold tracking-tight text-neutral-900 tnum">
              {matrix.label}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Tháng sau"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              ›
            </button>
          </div>

          {/* DOW header */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            {DOW.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {matrix.weeks.flat().map((cell, idx) => {
              if (!cell.inMonth)
                return <div key={idx} className="h-8" aria-hidden />;
              const isPast = cell.iso < today;
              const isSelected = cell.iso === value;
              const isCurrentDay = cell.iso === today;
              let cls =
                "h-8 w-full text-sm font-medium tnum transition-colors flex items-center justify-center rounded-md ";
              if (isPast) {
                cls += "text-neutral-300 cursor-not-allowed ";
              } else if (isSelected) {
                cls += "bg-neutral-900 text-white ";
              } else {
                cls += "text-neutral-700 hover:bg-neutral-100 ";
                if (isCurrentDay) cls += "ring-1 ring-inset ring-neutral-400 ";
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  className={cls}
                  aria-label={cell.iso}
                  aria-selected={isSelected}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {!isToday && (
            <div className="mt-2 flex justify-end border-t border-neutral-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(today);
                  setOpen(false);
                }}
                className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
              >
                ← Về hôm nay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="1.5"
        y="2.5"
        width="11"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 5.5h11M4.5 1v3M9.5 1v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
