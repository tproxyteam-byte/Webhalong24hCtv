"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyGallery } from "@/components/property/property-gallery";
import { AvailabilityCalendar } from "@/components/property/availability-calendar";
import { ShareButton } from "@/components/property/share-button";
import { getPropertyDetail } from "@/lib/api";
import { countAvailableNights, minCtvPriceNext30Days } from "@/lib/calendar";
import { formatVND, relativeTime, todayISO } from "@/lib/format";
import type { Property } from "@/lib/types";

interface PropertyClientViewProps {
  slug: string;
}

export function PropertyClientView({ slug }: PropertyClientViewProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      setIsError(false);
      try {
        const detail = await getPropertyDetail(slug);
        if (!active) return;
        if (!detail) {
          setIsError(true);
        } else {
          setProperty(detail);
          setToday(todayISO());
        }
      } catch (err) {
        console.error("Error loading property detail on client:", err);
        if (active) {
          setIsError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <SiteHeader showBack subtitle="Đang tải..." />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-teal-600"></div>
            <p className="text-sm font-semibold text-neutral-500 animate-pulse">Đang tải chi tiết căn hộ...</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (isError || !property) {
    notFound();
  }

  const minPrice = minCtvPriceNext30Days(property.pricing, today);
  const availNights = countAvailableNights(property.bookings, today, 30);
  const factor = 1 - property.pricing.ctvDiscount;
  const ctvWeekday = Math.round(property.pricing.weekday * factor);
  const ctvWeekend = Math.round(property.pricing.weekend * factor);

  return (
    <>
      <SiteHeader showBack subtitle={property.name} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <Link href="/" className="transition-colors hover:text-teal-700">
            Danh sách căn
          </Link>
          <span aria-hidden className="text-neutral-300">
            /
          </span>
          <span className="text-neutral-800 font-semibold">{property.building}</span>
        </nav>

        {/* Title block */}
        <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 sm:text-3xl">{property.name}</h1>
            <p className="mt-1.5 text-sm font-medium text-neutral-500">{property.address}</p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Giá CTV từ
            </p>
            <p className="text-2xl font-bold tracking-tight text-teal-800 tnum">
              {formatVND(minPrice)}
              <span className="ml-1 text-xs font-semibold text-neutral-500">/đêm</span>
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-6 shadow-sm rounded-2xl overflow-hidden">
          <PropertyGallery images={property.images} alt={property.name} />
        </div>

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-neutral-200/60 py-5 text-sm">
          <Meta
            label="Phòng ngủ"
            value={property.bedrooms === 0 ? "Studio" : `${property.bedrooms} PN`}
          />
          <Meta label="Phòng tắm" value={`${property.bathrooms} WC`} />
          <Meta label="Diện tích" value={`${property.floorArea} m²`} />
          <Meta label="Tối đa" value={`${property.maxGuests} khách`} />
          <Meta
            label="Trống 30 ngày"
            value={`${availNights} đêm`}
            highlight={availNights > 0}
          />
        </div>

        {/* Two column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
          <div className="flex flex-col gap-10 min-w-0">
            <section>
              <h2 className="text-lg font-bold text-neutral-800">Mô tả</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600 font-medium">
                {property.description}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-800">Tiện nghi</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200/50 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm"
                  >
                    <CheckIcon />
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3 border-b border-neutral-100 pb-3">
                <h2 className="text-lg font-bold text-neutral-800">Lịch trống 3 tháng tới</h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Còn{" "}
                  <span className="font-bold text-teal-700">{availNights}</span>{" "}
                  đêm trống / 30 ngày
                </p>
              </div>
              <div className="mt-4">
                <AvailabilityCalendar bookings={property.bookings} today={today} />
              </div>
            </section>

            {property.ownerNote && (
              <section className="rounded-2xl border border-teal-100 bg-gradient-to-tr from-teal-50/20 to-neutral-50/30 p-5 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Ghi chú từ chủ nhà
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700 font-medium">
                  "{property.ownerNote}"
                </p>
                <p className="mt-4 text-xs font-semibold text-neutral-400">
                  — {property.ownerName} · Cập nhật{" "}
                  {relativeTime(property.updatedAt)}
                </p>
              </section>
            )}
          </div>

          {/* Sticky pricing column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-md shadow-neutral-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Giá CTV (sau chiết khấu)
                </p>
                <p className="mt-1 text-xs text-neutral-500 font-medium leading-relaxed">
                  Chiết khấu <span className="font-bold text-teal-600">{Math.round(property.pricing.ctvDiscount * 100)}%</span> so với
                  giá niêm yết của chủ nhà
                </p>
              </div>
              <dl className="flex flex-col gap-3 text-sm border-t border-b border-neutral-100 py-4 font-semibold text-neutral-700">
                <PriceRow label="Ngày thường (CN – T5)" value={formatVND(ctvWeekday)} />
                <PriceRow label="Cuối tuần (T6, T7)" value={formatVND(ctvWeekend)} />
                {property.pricing.holiday && (
                  <PriceRow
                    label="Ngày Lễ tết"
                    value={formatVND(Math.round(property.pricing.holiday * factor))}
                  />
                )}
              </dl>

              <div className="flex flex-col gap-2.5">
                <ShareButton slug={property.slug} name={property.name} />
                {property.ownerPhone ? (
                  <>
                    <a
                      href={`https://zalo.me/${property.ownerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-[#0068ff] hover:bg-[#0054d1] text-white w-full text-center flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer outline-none"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 5.58 2 10c0 2.22 1.08 4.23 2.87 5.67L4 19.5c-.13.38.22.73.58.58l3.92-1.63c1.09.35 2.27.55 3.5.55 5.52 0 10-3.58 10-8s-4.48-8-10-8zm1 11h-2v-2h2v2zm0-4h-2V7h2v2z" />
                      </svg>
                      Zalo Gọi điện
                    </a>
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="btn border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 w-full text-center flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl transition-all active:scale-[0.98] outline-none"
                      aria-label={`Gọi chủ nhà ${property.ownerName}`}
                    >
                      Gọi {property.ownerName}
                    </a>
                  </>
                ) : (
                  <a
                    href="tel:0901234567"
                    className="btn btn-primary w-full shadow-md shadow-teal-950/10 text-center"
                    aria-label={`Gọi chủ nhà ${property.ownerName}`}
                  >
                    Gọi {property.ownerName}
                  </a>
                )}
              </div>

              <p className="text-center text-[10px] font-semibold text-neutral-400">
                Cập nhật {relativeTime(property.updatedAt)}
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Meta({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">{label}</span>
      <span
        className={
          "text-[13px] font-extrabold " + (highlight ? "text-teal-700" : "text-neutral-800")
        }
      >
        {value}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-neutral-500 font-medium" : "text-neutral-500 font-semibold"}>{label}</dt>
      <dd
        className={
          "font-bold tabular-nums " +
          (muted ? "text-neutral-500" : "text-teal-800")
        }
      >
        {value}
      </dd>
    </div>
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
      className="shrink-0 text-teal-600"
    >
      <path
        d="M2.5 7.5L5.5 10.5L11.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
