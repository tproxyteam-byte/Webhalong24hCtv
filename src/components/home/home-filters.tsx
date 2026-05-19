"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { QUICK_AMENITIES, type QuickAmenity } from "@/lib/amenities";

export type BedroomFilter = "all" | "studio" | "1" | "2" | "3" | "4+";
export type PriceMaxFilter =
  | 0
  | 1_000_000
  | 2_000_000
  | 3_000_000
  | 5_000_000
  | 10_000_000;

export interface FilterState {
  area: string;
  bedroom: BedroomFilter;
  priceMax: PriceMaxFilter;
  /** Multi-select — controlled by both Tiện ích/View dropdowns AND quick chip row */
  quickAmenities: string[];
}

export const INITIAL_FILTERS: FilterState = {
  area: "all",
  bedroom: "all",
  priceMax: 0,
  quickAmenities: [],
};

const BEDROOM_OPTIONS: Array<{ value: BedroomFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "studio", label: "Studio" },
  { value: "1", label: "1 phòng ngủ" },
  { value: "2", label: "2 phòng ngủ" },
  { value: "3", label: "3 phòng ngủ" },
  { value: "4+", label: "4+ phòng ngủ" },
];

const PRICE_OPTIONS: Array<{ value: PriceMaxFilter; label: string }> = [
  { value: 0, label: "Tất cả" },
  { value: 1_000_000, label: "Dưới 1 triệu / đêm" },
  { value: 2_000_000, label: "Dưới 2 triệu / đêm" },
  { value: 3_000_000, label: "Dưới 3 triệu / đêm" },
  { value: 5_000_000, label: "Dưới 5 triệu / đêm" },
  { value: 10_000_000, label: "Dưới 10 triệu / đêm" },
];

type PopoverKey = "area" | "bedroom" | "amenity" | "view" | "price";

interface HomeFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  areas: string[];
  showReset: boolean;
  onReset: () => void;
}

export function HomeFilters({
  filters,
  onChange,
  areas,
  showReset,
  onReset,
}: HomeFiltersProps) {
  const [open, setOpen] = useState<PopoverKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const featureItems = QUICK_AMENITIES.filter((a) => a.category === "feature");
  const viewItems = QUICK_AMENITIES.filter((a) => a.category === "view");

  const areaValue = filters.area === "all" ? "Hạ Long" : filters.area;
  const bedroomValue =
    BEDROOM_OPTIONS.find((o) => o.value === filters.bedroom)?.label ?? "Tất cả";
  const amenityValue = summarizeMulti(featureItems, filters.quickAmenities);
  const viewValue = summarizeMulti(viewItems, filters.quickAmenities);
  const priceValue =
    PRICE_OPTIONS.find((o) => o.value === filters.priceMax)?.label ?? "Tất cả";

  const toggleAmenity = (id: string) => {
    onChange({
      ...filters,
      quickAmenities: filters.quickAmenities.includes(id)
        ? filters.quickAmenities.filter((x) => x !== id)
        : [...filters.quickAmenities, id],
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterCard
          icon={<LocationIcon />}
          label="Khu vực"
          value={areaValue}
          isOpen={open === "area"}
          onToggle={() => setOpen(open === "area" ? null : "area")}
        >
          <OptionsList
            options={[
              { value: "all", label: "Tất cả (Hạ Long)" },
              ...areas.map((a) => ({ value: a, label: a })),
            ]}
            selected={filters.area}
            onSelect={(v) => {
              onChange({ ...filters, area: v });
              setOpen(null);
            }}
          />
        </FilterCard>

        <FilterCard
          icon={<BedIcon />}
          label="Loại phòng"
          value={bedroomValue}
          isOpen={open === "bedroom"}
          onToggle={() => setOpen(open === "bedroom" ? null : "bedroom")}
        >
          <OptionsList
            options={BEDROOM_OPTIONS}
            selected={filters.bedroom}
            onSelect={(v) => {
              onChange({ ...filters, bedroom: v });
              setOpen(null);
            }}
          />
        </FilterCard>

        <FilterCard
          icon={<GridIcon />}
          label="Tiện ích"
          value={amenityValue}
          isOpen={open === "amenity"}
          onToggle={() => setOpen(open === "amenity" ? null : "amenity")}
        >
          <MultiCheckList
            items={featureItems}
            selected={filters.quickAmenities}
            onToggle={toggleAmenity}
          />
        </FilterCard>

        <FilterCard
          icon={<EyeIcon />}
          label="View"
          value={viewValue}
          isOpen={open === "view"}
          onToggle={() => setOpen(open === "view" ? null : "view")}
        >
          <MultiCheckList
            items={viewItems}
            selected={filters.quickAmenities}
            onToggle={toggleAmenity}
          />
        </FilterCard>

        <FilterCard
          icon={<TagIcon />}
          label="Giá CTV"
          value={priceValue}
          isOpen={open === "price"}
          onToggle={() => setOpen(open === "price" ? null : "price")}
        >
          <OptionsList
            options={PRICE_OPTIONS}
            selected={filters.priceMax}
            onSelect={(v) => {
              onChange({ ...filters, priceMax: v });
              setOpen(null);
            }}
          />
        </FilterCard>

        <div className="ml-auto flex items-center gap-2">
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <CloseIcon /> Xóa bộ lọc
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              toast("Đã lưu bộ lọc hiện tại", {
                description: "Sẽ hiện ra khi mở lại trang.",
              })
            }
            className="btn btn-primary"
          >
            <BookmarkIcon /> Lưu tìm kiếm
          </button>
        </div>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none sm:flex-wrap sm:overflow-visible">
        {QUICK_AMENITIES.map((a) => {
          const active = filters.quickAmenities.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className="amenity-chip"
              data-active={active}
            >
              {active ? "✓ " : "+ "}
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function summarizeMulti(
  category: QuickAmenity[],
  selectedIds: string[],
): string {
  const matched = category.filter((c) => selectedIds.includes(c.id));
  if (matched.length === 0) return "Tất cả";
  if (matched.length === 1) return matched[0].label;
  return `${matched[0].label}, +${matched.length - 1}`;
}

function FilterCard({
  icon,
  label,
  value,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="filter-card"
      >
        <span className="filter-icon">{icon}</span>
        <span className="filter-text">
          <span className="filter-label">{label}</span>
          <span className="filter-value">{value}</span>
        </span>
        <svg
          className="filter-chev"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
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
      {isOpen && (
        <div
          role="menu"
          className="animate-popover absolute left-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[var(--shadow-pop)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function OptionsList<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>;
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <ul className="min-w-[220px] max-h-[60vh] overflow-y-auto py-1">
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <li key={String(opt.value)}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.value)}
              className={
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100 " +
                (isSelected
                  ? "text-neutral-900 font-medium"
                  : "text-neutral-700")
              }
            >
              <span>{opt.label}</span>
              {isSelected && <CheckIcon />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MultiCheckList({
  items,
  selected,
  onToggle,
}: {
  items: QuickAmenity[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="min-w-[220px] py-1">
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className={
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100 " +
                (isSelected
                  ? "text-neutral-900 font-medium"
                  : "text-neutral-700")
              }
            >
              <span>{item.label}</span>
              <span
                aria-hidden
                className={
                  "flex h-4 w-4 items-center justify-center rounded border " +
                  (isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white")
                }
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden>
      <path
        d="M10 17s-5-4.5-5-9a5 5 0 1 1 10 0c0 4.5-5 9-5 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden>
      <path
        d="M3 12V6m0 6v3m0-3h14m0 3v-3m0 0V8a2 2 0 0 0-2-2H9v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="10" r="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden>
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden>
      <path
        d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden>
      <path
        d="M3 9V4a1 1 0 0 1 1-1h5l8 8-6 6-8-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M4 2h8v12l-4-3-4 3V2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M3 3l8 8M11 3l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CheckIcon() {
  return (
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
  );
}
