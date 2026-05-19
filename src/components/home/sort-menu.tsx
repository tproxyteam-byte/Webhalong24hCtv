"use client";

import { useEffect, useRef, useState } from "react";

export type SortKey =
  | "default"
  | "price-asc"
  | "price-desc"
  | "avail-desc"
  | "bedrooms-asc"
  | "bedrooms-desc";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá CTV thấp → cao" },
  { value: "price-desc", label: "Giá CTV cao → thấp" },
  { value: "avail-desc", label: "Trống nhiều nhất" },
  { value: "bedrooms-asc", label: "Phòng ngủ ít → nhiều" },
  { value: "bedrooms-desc", label: "Phòng ngủ nhiều → ít" },
];

interface SortMenuProps {
  value: SortKey;
  onChange: (next: SortKey) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const isDefault = value === "default";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors " +
          (isDefault
            ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
            : "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50")
        }
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className="text-neutral-500"
        >
          <path
            d="M2 4h10M3.5 7h7M5 10h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-medium">Sắp xếp</span>
        {!isDefault && (
          <>
            <span aria-hidden className="text-neutral-300">
              ·
            </span>
            <span className="font-medium">{current.label}</span>
          </>
        )}
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
        <div
          role="menu"
          className="animate-popover absolute right-0 top-full z-40 mt-1.5 min-w-[220px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[var(--shadow-pop)]"
        >
          <ul className="py-1">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100 " +
                      (isSelected
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-700")
                    }
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                        className="shrink-0 text-neutral-900"
                      >
                        <path
                          d="M2.5 7.5L5.5 10.5L11.5 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
