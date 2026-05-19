import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatVND } from "@/lib/format";

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
  const cover = property.images[0];
  const hasAvail = availableNights > 0;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative ar-43 w-full overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-neutral-900 backdrop-blur-sm">
            {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} PN`}
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-600">{property.maxGuests} khách</span>
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          {hasAvail ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-neutral-900 backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-avail-fg)]"
                aria-hidden
              />
              Còn {availableNights}/30 đêm trống
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-neutral-900 backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-booked-fg)]"
                aria-hidden
              />
              Kín lịch 30 ngày
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-h3 truncate">{property.name}</h3>
            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {property.building}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400">
              Giá CTV từ
            </p>
            <p className="text-base font-semibold text-neutral-900 tnum">
              {formatVND(minCtvPrice)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span>{property.floorArea}m²</span>
          <span aria-hidden className="text-neutral-300">
            ·
          </span>
          <span>{property.bathrooms} WC</span>
          <span aria-hidden className="text-neutral-300">
            ·
          </span>
          <span className="truncate">{property.amenities[0]}</span>
        </div>
      </div>
    </Link>
  );
}
