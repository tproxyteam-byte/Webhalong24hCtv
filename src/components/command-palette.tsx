"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import type { Property } from "@/lib/types";
import { countAvailableNights, minCtvPriceNext30Days } from "@/lib/calendar";
import {
  formatCompactVND,
  todayISO,
} from "@/lib/format";
import { useIsMac } from "@/hooks/use-is-mac";

export const COMMAND_PALETTE_OPEN_EVENT = "websale:open-command-palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMac = useIsMac();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).__activeProperties) {
        setProperties((window as any).__activeProperties);
        setIsLoading(false);
      }
      const handler = () => {
        if ((window as any).__activeProperties) {
          setProperties((window as any).__activeProperties);
          setIsLoading(false);
        }
      };
      window.addEventListener("websale:active-properties-updated", handler);
      return () => window.removeEventListener("websale:active-properties-updated", handler);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      // If we already have window-level active properties, we don't need to load all properties from the API
      if (typeof window !== "undefined" && (window as any).__activeProperties) {
        return;
      }
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error("Failed to load properties");
        const result = await response.json();
        if (active) setProperties(result.data ?? []);
      } catch (error) {
        console.error("Search properties error:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProperties();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (k === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (k === "escape") setOpen(false);
    }
    function onCustomOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, onCustomOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, onCustomOpen);
    };
  }, []);

  if (!open) return null;

  const today = todayISO();

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/property/${slug}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm căn nhanh"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-neutral-900/40 backdrop-blur-sm"
      />
      <Command
        label="Tìm căn"
        className="animate-popover relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4">
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-neutral-400"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5 14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <Command.Input
            placeholder="Tìm căn theo tên…"
            className="h-12 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-neutral-400"
          />
          <kbd className="ml-2 hidden h-5 shrink-0 items-center rounded border border-neutral-200 bg-neutral-50 px-1.5 font-mono text-[10px] font-medium text-neutral-500 sm:inline-flex">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-1.5 scrollbar-thin">
          {isLoading && (
            <div className="px-3 py-8 text-center text-sm text-neutral-500">
              Đang tải danh sách căn…
            </div>
          )}
          {!isLoading && (
            <Command.Empty className="px-3 py-8 text-center text-sm text-neutral-500">
              Không tìm thấy căn nào phù hợp.
            </Command.Empty>
          )}
          <Command.Group
            heading="Căn hộ"
            className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {properties.map((p) => {
              const factor = 1 - p.pricing.ctvDiscount;
              const ctvWeekend = Math.round(p.pricing.weekend * factor);
              const availNights = countAvailableNights(p.bookings, today, 30);
              const minPrice = minCtvPriceNext30Days(p.pricing, today);
              const searchKey = p.name.toLowerCase();

              return (
                <Command.Item
                  key={p.id}
                  value={searchKey}
                  onSelect={() => handleSelect(p.slug)}
                  className="group/item flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors data-[selected=true]:bg-neutral-100"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:h-11 sm:w-11">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900">
                      {p.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                      <span className="truncate">{p.building}</span>
                      <span aria-hidden className="text-neutral-300">
                        ·
                      </span>
                      <span>{p.area}</span>
                      <span aria-hidden className="text-neutral-300">
                        ·
                      </span>
                      <span>
                        {p.bedrooms === 0 ? "Studio" : `${p.bedrooms}PN`}
                      </span>
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-[11px] text-neutral-400 tnum">
                      {formatCompactVND(minPrice)} / đêm
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium">
                      <span
                        className={
                          "inline-block h-1.5 w-1.5 rounded-full " +
                          (availNights > 0
                            ? "bg-[var(--color-avail-fg)]"
                            : "bg-[var(--color-booked-fg)]")
                        }
                        aria-hidden
                      />
                      <span className="text-neutral-700">
                        {availNights > 0 ? `${availNights} đêm trống` : "Kín lịch"}
                      </span>
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden shrink-0 text-neutral-300 transition-colors group-data-[selected=true]/item:text-neutral-900 sm:inline"
                  >
                    →
                  </span>
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] font-medium">
                ↑
              </kbd>
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] font-medium">
                ↓
              </kbd>
              di chuyển
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex h-4 items-center rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              chọn
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="inline-flex h-4 items-center rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] font-medium">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
              đóng
            </span>
          </div>
          <span className="hidden sm:inline">
            {properties.length} căn
          </span>
        </div>
      </Command>
    </div>
  );
}

/** Header trigger — search-style button hiển thị kbd ⌘K / Ctrl+K */
export function CommandPaletteTrigger() {
  const isMac = useIsMac();

  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT))
      }
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
      aria-label="Tìm căn nhanh"
    >
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0"
      >
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9.25 9.25 12.5 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline">Tìm căn</span>
      <kbd className="ml-1 inline-flex h-5 items-center rounded border border-neutral-200 bg-neutral-50 px-1.5 font-mono text-[10px] font-medium">
        {isMac ? "⌘" : "Ctrl"}+K
      </kbd>
    </button>
  );
}
