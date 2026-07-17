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
import { useFavorites } from "@/hooks/use-favorites";

interface PropertyClientViewProps {
  slug: string;
  propertyId?: string;
  activeOwnerId?: string;
  from?: string;
}

export function PropertyClientView({
  slug,
  propertyId,
  activeOwnerId,
  from,
}: PropertyClientViewProps) {
  const { favorites } = useFavorites();
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
        const detail = await getPropertyDetail(slug, propertyId);
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
  }, [slug, propertyId]);

  const backHref = from === "zalo" && activeOwnerId
    ? `/zalo-cal/${activeOwnerId}`
    : activeOwnerId
    ? `/calendar/properties?ownerId=${activeOwnerId}`
    : "/";

  if (isLoading) {
    return (
      <>
        <SiteHeader
          showBack
          subtitle="Đang tải..."
          favoritesCount={favorites.length}
          onFavoritesToggle={() => {
            window.location.href = "/calendar/properties?favorites=true";
          }}
          ownerId={activeOwnerId}
          from={from}
        />
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
    return (
      <>
        <SiteHeader
          showBack
          subtitle="Lỗi"
          favoritesCount={favorites.length}
          onFavoritesToggle={() => {
            window.location.href = "/calendar/properties?favorites=true";
          }}
          ownerId={activeOwnerId}
          from={from}
        />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-500/10 bg-gradient-to-b from-red-500/5 to-transparent p-8 text-center shadow-lg relative">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-400/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200/50 text-red-600 shadow-sm">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="space-y-2.5">
                <h1 className="text-xl font-bold tracking-tight text-neutral-800">
                  Căn hộ không tồn tại
                </h1>
                <p className="text-sm font-semibold text-neutral-500 leading-relaxed">
                  Liên kết không hợp lệ hoặc căn hộ đã bị xóa.
                </p>
              </div>

              <Link
                href={backHref}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 text-xs font-bold shadow-md shadow-teal-500/10 active:scale-95 transition-all outline-none"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const minPrice = minCtvPriceNext30Days(property.pricing, today);
  const availNights = countAvailableNights(property.bookings, today, 30);
  const factor = 1 - property.pricing.ctvDiscount;
  const ctvWeekday = Math.round(property.pricing.weekday * factor);
  const ctvWeekend = Math.round(property.pricing.weekend * factor);

  return (
    <>
      <SiteHeader
        showBack
        subtitle={property.name}
        favoritesCount={favorites.length}
        onFavoritesToggle={() => {
          window.location.href = "/calendar/properties?favorites=true";
        }}
        ownerId={activeOwnerId}
        from={from}
      />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <Link href="/calendar/properties" className="transition-colors hover:text-teal-700">
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
            {property.mapLink && (
              <a
                href={property.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors hover:underline select-none cursor-pointer outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                </svg>
                Xem vị trí trên Google Maps
              </a>
            )}
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Giá CTV từ
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-teal-700 tnum">
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
          <Meta label="Tiêu chuẩn" value={`${property.standardGuests ?? property.maxGuests} khách`} />
        </div>

        {/* Two column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
          <div className="flex flex-col gap-10 min-w-0">
            <section>
              <h2 className="text-lg font-bold text-neutral-800">Mô tả</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-600 font-medium whitespace-pre-wrap">
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
                    {getAmenityIcon(a)}
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-4 flex flex-col gap-2 border-b border-neutral-200/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Lịch trống 3 tháng tới</h2>
                  <p className="mt-1 text-xs font-medium text-neutral-400">Cập nhật trực tiếp từ lịch chủ nhà</p>
                </div>
                <p className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-100">
                  <span className="font-extrabold">{availNights}</span> đêm trống / 30 ngày
                </p>
              </div>
              <AvailabilityCalendar bookings={property.bookings} today={today} />
            </section>

            {property.ownerNote && (
              <section className="rounded-2xl border border-teal-100 bg-gradient-to-tr from-teal-50/20 to-neutral-50/30 p-5 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Ghi chú từ chủ nhà
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700 font-medium whitespace-pre-wrap">
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
              <dl className="flex flex-col gap-3 text-sm border-b border-neutral-100 pb-4 font-semibold text-neutral-700">
                <PriceRow label="Ngày thường (CN – T5)" value={formatVND(ctvWeekday)} type="weekday" />
                <PriceRow label="Cuối tuần (T6, T7)" value={formatVND(ctvWeekend)} type="weekend" />
                {property.pricing.holiday && (
                  <PriceRow
                    label="Ngày Lễ tết"
                    value={formatVND(Math.round(property.pricing.holiday * factor))}
                    type="holiday"
                  />
                )}
              </dl>

              <div className="flex flex-col gap-2.5">
                <ShareButton propertyId={property.id} name={property.name} />
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
                      Nhắn tin Zalo
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
                    className="btn border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 w-full text-center flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl transition-all active:scale-[0.98] outline-none"
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
  type,
  muted = false,
}: {
  label: string;
  value: string;
  type?: "weekday" | "weekend" | "holiday";
  muted?: boolean;
}) {
  let colorClass = "text-teal-800";
  if (muted) {
    colorClass = "text-neutral-500";
  } else if (type === "weekday") {
    colorClass = "text-slate-900";
  } else if (type === "weekend") {
    colorClass = "text-teal-700";
  } else if (type === "holiday") {
    colorClass = "text-rose-600";
  }

  return (
    <div className="flex items-center justify-between py-0.5">
      <dt className={muted ? "text-neutral-500 font-medium text-xs" : "text-neutral-600 font-semibold text-xs"}>{label}</dt>
      <dd className={`font-bold tabular-nums text-sm sm:text-base ${colorClass}`}>
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

function getAmenityIcon(name: string) {
  const n = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

  const wrapper = (paths: React.ReactNode) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-teal-600"
      aria-hidden
    >
      {paths}
    </svg>
  );

  if (n.includes("wifi")) {
    return wrapper(
      <>
        <path d="M5 12a10 10 0 0 1 14 0" />
        <path d="M8.5 15.5a5 5 0 0 1 7 0" />
        <path d="M2 8.5a15 15 0 0 1 20 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    );
  }
  if (n.includes("tv")) {
    return wrapper(
      <>
        <rect x="2" y="3" width="20" height="15" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </>
    );
  }
  if (n.includes("karaoke")) {
    return wrapper(
      <>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </>
    );
  }
  if (n.includes("dieu hoa")) {
    return wrapper(
      <>
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="m20 16-4-4 4-4" />
        <path d="m4 8 4 4-4 4" />
        <path d="m16 4-4 4-4-4" />
        <path d="m8 20 4-4 4 4" />
      </>
    );
  }
  if (n.includes("loa di dong") || n.includes("loa")) {
    return wrapper(
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <circle cx="12" cy="14" r="4" />
        <line x1="12" y1="6" x2="12.01" y2="6" />
      </>
    );
  }
  if (n.includes("bep day du") || n.includes("bep lon") || n.includes("bep ga")) {
    return wrapper(
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <line x1="7" y1="2" x2="7" y2="11" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v3c0 2.5 1.5 5 5 5Z" />
        <path d="M16 15v7" />
        <path d="M7 11v11" />
      </>
    );
  }
  if (n.includes("tu lanh")) {
    return wrapper(
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="9" y1="5" x2="9" y2="9" />
        <line x1="9" y1="15" x2="9" y2="19" />
      </>
    );
  }
  if (n.includes("lo vi song")) {
    return wrapper(
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <rect x="5" y="7" width="10" height="10" rx="1" />
        <circle cx="18" cy="9" r="1" />
        <circle cx="18" cy="13" r="1" />
        <circle cx="18" cy="17" r="1" />
      </>
    );
  }
  if (n.includes("bat dua") || n.includes("bat") || n.includes("dua")) {
    return wrapper(
      <>
        <path d="M2 12a10 10 0 0 0 20 0Z" />
        <path d="M12 2v10" />
        <path d="m15 2 2 10" />
      </>
    );
  }
  if (n.includes("bep tu")) {
    return wrapper(
      <>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="16" r="3" />
      </>
    );
  }
  if (n.includes("voi sen")) {
    return wrapper(
      <>
        <path d="M7 4a5 5 0 0 1 10 0v8a3 3 0 0 0 3 3h2" />
        <path d="M11 17v.01" />
        <path d="M13 19v.01" />
        <path d="M9 19v.01" />
        <path d="M11 21v.01" />
        <path d="M15 17v.01" />
      </>
    );
  }
  if (n.includes("nuoc nong")) {
    return wrapper(
      <>
        <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    );
  }
  if (n.includes("may say toc") || n.includes("may say")) {
    return wrapper(
      <>
        <path d="M12.8 18a4.6 4.6 0 0 0-4.3-3H2" />
        <path d="M20 12a5 5 0 0 0-4.5-3H2" />
        <path d="M18 6a4 4 0 0 0-3.8-3H2" />
      </>
    );
  }
  if (n.includes("khan tam") || n.includes("khan")) {
    return wrapper(
      <>
        <path d="M2 17h20" />
        <path d="M2 12h20" />
        <rect x="2" y="5" width="20" height="14" rx="2" />
      </>
    );
  }
  if (n.includes("dau goi") || n.includes("sua tam") || n.includes("tam")) {
    return wrapper(
      <>
        <rect x="6" y="9" width="12" height="13" rx="2" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        <path d="M12 3v3" />
      </>
    );
  }
  if (n.includes("ban cong")) {
    return wrapper(
      <>
        <path d="M2 22v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
        <line x1="6" y1="16" x2="6" y2="22" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="18" y1="16" x2="18" y2="22" />
        <path d="M20 12h2v-4h-2" />
        <path d="M4 12H2v-4h2" />
      </>
    );
  }
  if (n.includes("be boi") || n.includes("ho boi")) {
    return wrapper(
      <>
        <path d="M2 6c.6.5 1.2 1 2.5 1C6 7 7 6 8.5 6c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1c1.3 0 1.9-.5 2.5-1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 1.5 0 2.5-1 4-1s2.5 1 4 1 2.5-1 4-1 2.5 1 4 1c1.3 0 1.9-.5 2.5-1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 1.5 0 2.5-1 4-1s2.5 1 4 1 2.5-1 4-1 2.5 1 4 1c1.3 0 1.9-.5 2.5-1" />
      </>
    );
  }
  if (n.includes("do xe") || n.includes("bai do") || n.includes("o to")) {
    return wrapper(
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </>
    );
  }
  if (n.includes("san vuon") || n.includes("vuon") || n.includes("cay")) {
    return wrapper(
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.2a7 7 0 0 1-9 8.8Z" />
        <path d="M19 2 9.8 11.2" />
      </>
    );
  }
  if (n.includes("may giat")) {
    return wrapper(
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <circle cx="12" cy="13" r="1" />
        <circle cx="8" cy="6" r="0.5" />
        <circle cx="16" cy="6" r="0.5" />
      </>
    );
  }
  if (n.includes("thang may")) {
    return wrapper(
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m7 10 3-3 3 3" />
        <path d="m7 14 3 3 3-3" />
        <path d="M10 7v10" />
      </>
    );
  }
  if (n.includes("bida") || n.includes("bi-da")) {
    return wrapper(
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.1" />
        <path d="M12 10a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1 0-3Z" />
        <path d="M12 13a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1 0-3Z" />
      </>
    );
  }
  if (n.includes("bbq") || n.includes("nuong ngoai troi") || n.includes("vi nuong")) {
    return wrapper(
      <>
        <path d="M12 2v4" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M4 10h16a1 1 0 0 1 1 1v2a8 8 0 0 1-16 0v-2a1 1 0 0 1 1-1Z" />
        <path d="M6 18l-2 4" />
        <path d="M18 18l2 4" />
        <path d="M12 18v4" />
      </>
    );
  }
  if (n.includes("nuoc loc") || n.includes("nuoc uong") || n.includes("nuoc free") || n.includes("nuoc khoang")) {
    return wrapper(
      <>
        <path d="M10 2h4v3h-4z" />
        <path d="M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
        <path d="M10 12h4" />
      </>
    );
  }
  if (n.includes("den suoi")) {
    return wrapper(
      <>
        <path d="M3 5h18v4H3z" />
        <path d="M7 13c.5 1 1.5 2 3 2s2.5-1 3-2 1.5-2 3-2 2.5 1 3 2" />
        <path d="M7 18c.5 1 1.5 2 3 2s2.5-1 3-2 1.5-2 3-2 2.5 1 3 2" />
      </>
    );
  }
  if (n.includes("view bien") || n.includes("seaview")) {
    return wrapper(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M2 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
        <path d="M2 20c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      </>
    );
  }
  if (n.includes("san thuong")) {
    return wrapper(
      <>
        <path d="M2 22h20" />
        <path d="M4 22V10h8V6h6v16" />
        <path d="M14 6l4-4" />
        <path d="M8 14h2" />
        <path d="M8 18h2" />
      </>
    );
  }
  if (n.includes("ban la") || n.includes("ban ui")) {
    return wrapper(
      <>
        <path d="M4 18h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6C12 7 9 10 7 13H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2z" />
        <path d="M9 7V4a1 1 0 0 1 1-1h5" />
      </>
    );
  }
  if (n.includes("tu quan ao")) {
    return wrapper(
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
      </>
    );
  }
  if (n.includes("ket sat")) {
    return wrapper(
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 10v4" />
        <path d="M10 12h4" />
      </>
    );
  }
  if (n.includes("bong ban")) {
    return wrapper(
      <>
        <path d="M2 12h20" />
        <path d="M12 9v6" />
        <path d="M6 12v6" />
        <path d="M18 12v6" />
        <circle cx="8" cy="7" r="1.5" />
        <circle cx="16" cy="7" r="1.5" />
      </>
    );
  }
  if (n.includes("xich du")) {
    return wrapper(
      <>
        <path d="M4 2v20" />
        <path d="M20 2v20" />
        <path d="M4 2h16" />
        <path d="M8 2v10h8V2" />
        <path d="M6 15h12v2H6z" />
      </>
    );
  }
  if (n.includes("tre em") || n.includes("kids-area") || n.includes("khu vui choi")) {
    return wrapper(
      <>
        <path d="M4 14V4h2v10" />
        <path d="M3 8h4" />
        <path d="M3 11h4" />
        <path d="M6 6c3 0 6 3 9 7s4 7 7 7" />
        <circle cx="5" cy="2" r="1.5" />
      </>
    );
  }

  return <CheckIcon />;
}
