import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { getPropertiesByOwner, type PublicOwner } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ ownerId: string }>;
}

/** Giữ lại chữ số + dấu "+" để dùng cho link tel: và zalo.me. */
function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function ownerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function generateMetadata({ params }: PageProps) {
  const { ownerId } = await params;
  const result = await getPropertiesByOwner(ownerId);
  if (!result) return { title: "Lịch phòng không tồn tại — Webhalong24h Sale" };
  return {
    title: `Lịch phòng của ${result.owner.name} — Webhalong24h Sale`,
    description: `Xem lịch trống, giá phòng và liên hệ trực tiếp ${result.owner.name} qua Zalo.`,
    robots: { index: false, follow: false },
  };
}

export default async function ZaloCalPage({ params }: PageProps) {
  const { ownerId } = await params;
  const today = todayISO();
  const result = await getPropertiesByOwner(ownerId, today, addDays(today, 90));
  if (!result) notFound();

  const { owner, properties } = result;
  const areas = Array.from(new Set(properties.map((p) => p.area))).sort();

  const now = new Date();
  const updatedLabel = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  return (
    <>
      <SiteHeader subtitle={`Lịch phòng · ${owner.name}`} />
      <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <OwnerHero owner={owner} roomCount={properties.length} />

        {properties.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-h2">Chưa có phòng nào được công khai</p>
            <p className="text-sm text-neutral-500">
              Chủ nhà chưa mở lịch phòng nào. Vui lòng liên hệ trực tiếp để được hỗ trợ.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <HomeView
              properties={properties}
              areas={areas}
              today={today}
              updatedLabel={updatedLabel}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function OwnerHero({
  owner,
  roomCount,
}: {
  owner: PublicOwner;
  roomCount: number;
}) {
  const phone = owner.phone ? sanitizePhone(owner.phone) : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-tr from-teal-50/40 via-white to-neutral-50/40 p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {owner.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={owner.avatarUrl}
              alt={owner.name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-700 to-indigo-900 text-lg font-bold text-white shadow-sm ring-2 ring-white"
            >
              {ownerInitials(owner.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Lịch phòng chia sẻ qua Zalo
            </p>
            <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
              {owner.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {roomCount > 0 ? `${roomCount} căn đang mở lịch` : "Chủ nhà tại Halong24h"}
            </p>
          </div>
        </div>

        {phone && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={`https://zalo.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shadow-md shadow-teal-950/10 text-center"
              aria-label={`Nhắn Zalo cho ${owner.name}`}
            >
              Gọi Zalo {owner.name}
            </a>
            <a
              href={`tel:${phone}`}
              className="btn text-center border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              aria-label={`Gọi điện cho ${owner.name}`}
            >
              Gọi {owner.phone}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
