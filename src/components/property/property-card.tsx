"use client";

import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { useFavorites } from "@/hooks/use-favorites";

interface PropertyCardProps {
  property: Property;
  /** Giá CTV tối thiểu 30 ngày tới đã tính sẵn ở parent */
  minCtvPrice: number;
  /** Số đêm trống / 30 ngày tới */
  availableNights: number;
}

export function PropertyCard({
  property,
  minCtvPrice,
  availableNights,
}: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(property.id);
  const cover = property.images[0];
  const hasAvail = availableNights > 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_12px_24px_-4px_rgba(13,148,136,0.06)]"
    >
      <div className="relative ar-43 w-full overflow-hidden bg-neutral-100">
        <div className="absolute right-3 top-3 z-10">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-rose-500 backdrop-blur-md shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={isFav ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill={isFav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M10 17s-6.5-3.6-6.5-8.2A3.3 3.3 0 0 1 10 6a3.3 3.3 0 0 1 6.5 2.8C16.5 13.4 10 17 10 17z" />
            </svg>
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
            {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} PN`}
            <span className="text-white/40">·</span>
            <span className="text-white/95">{property.maxGuests} khách</span>
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          {hasAvail ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200/30 px-2.5 py-1 text-[11px] font-bold text-emerald-800 backdrop-blur-md shadow-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden
              />
              Còn {availableNights}/30 đêm trống
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50/90 border border-rose-200/30 px-2.5 py-1 text-[11px] font-bold text-rose-800 backdrop-blur-md shadow-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose-500"
                aria-hidden
              />
              Kín lịch 30 ngày
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-neutral-800 truncate group-hover:text-teal-700 transition-colors">
              {property.name}
            </h3>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
              {property.building}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
              Giá CTV từ
            </p>
            <p className="text-base font-extrabold text-teal-700 tnum">
              {formatVND(minCtvPrice)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-neutral-500 border-t border-neutral-100 pt-3">
          <span className="bg-neutral-50 border border-neutral-200/60 rounded px-1.5 py-0.5 text-[10px] text-neutral-600">{property.floorArea}m²</span>
          <span className="bg-neutral-50 border border-neutral-200/60 rounded px-1.5 py-0.5 text-[10px] text-neutral-600">{property.bathrooms} WC</span>
          <span aria-hidden className="text-neutral-300">
            ·
          </span>
          <span className="truncate text-[11px] font-semibold text-neutral-500">{property.amenities[0]}</span>
        </div>
      </div>
    </Link>
  );
}
