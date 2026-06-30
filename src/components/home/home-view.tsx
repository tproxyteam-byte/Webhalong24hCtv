"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Property } from "@/lib/types";
import {
  countAvailableNights,
  minCtvPriceNext30Days,
} from "@/lib/calendar";
import { propertyMatchesAmenities } from "@/lib/amenities";
import {
  HomeFilters,
  INITIAL_FILTERS,
  type BedroomFilter,
  type FilterState,
} from "./home-filters";
import { SortMenu, type SortKey } from "./sort-menu";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { AvailabilityMatrix } from "./availability-matrix";
import { MatrixDatePicker } from "./matrix-date-picker";
import { CardView } from "./card-view";

interface HomeViewProps {
  properties: Property[];
  areas: string[];
  today: string;
  updatedLabel: string;
}

const VIEW_STORAGE_KEY = "websale.view";

/**
 * SSR-safe đọc preferred view từ localStorage. Server render trả "matrix" mặc định;
 * sau hydrate, client tự đọc và sync — không gọi setState trong useEffect (tránh
 * lỗi react-hooks/set-state-in-effect trên React 19).
 */
function subscribeView(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === VIEW_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getViewSnapshot(): ViewMode {
  if (typeof window === "undefined") return "matrix";
  const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
  if (stored === "card" || stored === "matrix") return stored;
  // Chưa có preference — mobile default Card (matrix khó cuộn ngang trên điện thoại)
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  return isDesktop ? "matrix" : "card";
}

function getServerViewSnapshot(): ViewMode {
  return "matrix";
}

function matchesBedroom(p: Property, filter: BedroomFilter): boolean {
  if (filter === "all") return true;
  if (filter === "studio") return p.bedrooms === 0;
  if (filter === "4+") return p.bedrooms >= 4;
  return p.bedrooms === Number(filter);
}

function filterProperties(
  properties: Property[],
  filters: FilterState,
  today: string,
): Property[] {
  return properties.filter((p) => {
    if (filters.area !== "all" && p.area !== filters.area) return false;
    if (!matchesBedroom(p, filters.bedroom)) return false;
    if (filters.priceMax > 0) {
      const minPrice = minCtvPriceNext30Days(p.pricing, today);
      if (minPrice > filters.priceMax) return false;
    }
    if (!propertyMatchesAmenities(p.amenities, filters.quickAmenities)) return false;
    return true;
  });
}

function sortProperties(
  properties: Property[],
  sort: SortKey,
  today: string,
): Property[] {
  if (sort === "default") return properties;
  const arr = [...properties];
  if (sort === "price-asc" || sort === "price-desc") {
    const cache = new Map<string, number>();
    const get = (p: Property) => {
      const v = cache.get(p.id);
      if (v !== undefined) return v;
      const n = minCtvPriceNext30Days(p.pricing, today);
      cache.set(p.id, n);
      return n;
    };
    arr.sort((a, b) =>
      sort === "price-asc" ? get(a) - get(b) : get(b) - get(a),
    );
  } else if (sort === "avail-desc") {
    const cache = new Map<string, number>();
    const get = (p: Property) => {
      const v = cache.get(p.id);
      if (v !== undefined) return v;
      const n = countAvailableNights(p.bookings, today, 30);
      cache.set(p.id, n);
      return n;
    };
    arr.sort((a, b) => get(b) - get(a));
  } else if (sort === "bedrooms-asc") {
    arr.sort((a, b) => a.bedrooms - b.bedrooms);
  } else if (sort === "bedrooms-desc") {
    arr.sort((a, b) => b.bedrooms - a.bedrooms);
  }
  return arr;
}

function isFiltersDirty(f: FilterState): boolean {
  return (
    f.area !== "all" ||
    f.bedroom !== "all" ||
    f.priceMax !== 0 ||
    f.quickAmenities.length > 0
  );
}

export function HomeView({ properties, areas, today, updatedLabel }: HomeViewProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__activeProperties = properties;
      window.dispatchEvent(new CustomEvent("websale:active-properties-updated"));
    }
  }, [properties]);

  const storedView = useSyncExternalStore(
    subscribeView,
    getViewSnapshot,
    getServerViewSnapshot,
  );
  const [viewOverride, setViewOverride] = useState<ViewMode | null>(null);
  const view = viewOverride ?? storedView;
  const setView = (next: ViewMode) => {
    setViewOverride(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    }
  };
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortKey>("default");
  const [matrixStart, setMatrixStart] = useState<string>(today);

  const filtered = useMemo(
    () => filterProperties(properties, filters, today),
    [properties, filters, today],
  );
  const sorted = useMemo(
    () => sortProperties(filtered, sort, today),
    [filtered, sort, today],
  );

  const dirty = isFiltersDirty(filters);

  return (
    <div className="flex flex-col gap-5">
      <HomeFilters
        filters={filters}
        onChange={setFilters}
        areas={areas}
        showReset={dirty}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-base font-semibold text-neutral-900 tnum">
            {sorted.length} căn
          </p>
          <p className="text-xs text-neutral-500">
            Cập nhật lúc {updatedLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MatrixDatePicker
            value={matrixStart}
            today={today}
            onChange={setMatrixStart}
          />
          <SortMenu value={sort} onChange={setSort} />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
          <p className="text-h2">Không có căn nào phù hợp</p>
          <p className="text-sm text-neutral-500">
            Thử bỏ bớt bộ lọc để xem thêm căn.
          </p>
        </div>
      ) : view === "matrix" ? (
        <AvailabilityMatrix
          properties={sorted}
          today={today}
          startDate={matrixStart}
        />
      ) : (
        <CardView properties={sorted} today={today} />
      )}
    </div>
  );
}

