import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PropertyGallery } from "@/components/property/property-gallery";
import { AvailabilityCalendar } from "@/components/property/availability-calendar";
import { ShareButton } from "@/components/property/share-button";
import { getPropertyBySlug, SAMPLE_PROPERTIES } from "@/lib/sample-properties";
import { countAvailableNights, minCtvPriceNext30Days } from "@/lib/calendar";
import { formatVND, relativeTime, todayISO } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SAMPLE_PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Căn không tồn tại — Webhalong24h Sale" };
  return {
    title: `${property.name} — ${property.building} | Webhalong24h Sale`,
    description: property.description.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const today = todayISO();
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
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="transition-colors hover:text-neutral-900">
            Danh sách căn
          </Link>
          <span aria-hidden className="text-neutral-300">
            /
          </span>
          <span className="text-neutral-700">{property.building}</span>
        </nav>

        {/* Title block */}
        <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-h1">{property.name}</h1>
            <p className="mt-1.5 text-sm text-neutral-600">{property.address}</p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400">
              Giá CTV từ
            </p>
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 tnum">
              {formatVND(minPrice)}
              <span className="ml-1 text-sm font-normal text-neutral-500">/đêm</span>
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-6">
          <PropertyGallery images={property.images} alt={property.name} />
        </div>

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-neutral-200 py-4 text-sm">
          <Meta
            label="Phòng ngủ"
            value={property.bedrooms === 0 ? "Studio" : `${property.bedrooms} PN`}
          />
          <Meta label="Phòng tắm" value={`${property.bathrooms} WC`} />
          <Meta label="Diện tích" value={`${property.floorArea} m²`} />
          <Meta label="Tối đa" value={`${property.maxGuests} khách`} />
          <Meta
            label="Trống 30 ngày tới"
            value={`${availNights} đêm`}
            highlight={availNights > 0}
          />
        </div>

        {/* Two column layout */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
          <div className="flex flex-col gap-12 min-w-0">
            <section>
              <h2 className="text-h2">Mô tả</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-neutral-700">
                {property.description}
              </p>
            </section>

            <section>
              <h2 className="text-h2">Tiện nghi</h2>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {property.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-700"
                  >
                    <CheckIcon />
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-h2">Lịch 3 tháng tới</h2>
                <p className="text-sm text-neutral-500">
                  Còn{" "}
                  <span className="font-semibold text-neutral-900">{availNights}</span>{" "}
                  đêm trống / 30 ngày
                </p>
              </div>
              <div className="mt-4">
                <AvailabilityCalendar bookings={property.bookings} today={today} />
              </div>

            </section>

            {property.ownerNote && (
              <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Ghi chú từ chủ nhà
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                  {property.ownerNote}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  — {property.ownerName} · Cập nhật{" "}
                  {relativeTime(property.updatedAt)}
                </p>
              </section>
            )}
          </div>

          {/* Sticky pricing column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Giá CTV (sau chiết khấu)
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Chiết khấu {Math.round(property.pricing.ctvDiscount * 100)}% so với
                  giá niêm yết
                </p>
              </div>
              <dl className="flex flex-col gap-2 text-sm">
                <PriceRow label="CN – T5" value={formatVND(ctvWeekday)} />
                <PriceRow label="T6, T7" value={formatVND(ctvWeekend)} />
                {property.pricing.holiday && (
                  <PriceRow
                    label="Lễ tết"
                    value={formatVND(Math.round(property.pricing.holiday * factor))}
                  />
                )}
              </dl>

              <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4">
                <ShareButton slug={property.slug} name={property.name} />
                <a
                  href="tel:0987654321"
                  className="btn btn-primary w-full"
                  aria-label={`Gọi chủ nhà ${property.ownerName}`}
                >
                  Gọi {property.ownerName}
                </a>
              </div>

              <p className="text-center text-xs text-neutral-500">
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
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span
        className={
          "font-semibold " + (highlight ? "text-neutral-900" : "text-neutral-800")
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
      <dt className={muted ? "text-neutral-500" : "text-neutral-700"}>{label}</dt>
      <dd
        className={
          "font-medium tabular-nums " +
          (muted ? "text-neutral-500" : "text-neutral-900")
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
      className="shrink-0 text-neutral-400"
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
