import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { OwnerBanner } from "@/components/owner/owner-banner";
import { getProperties } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface CalendarPropertiesPageProps {
  searchParams: Promise<{ ownerId?: string }>;
}

export default async function CalendarPropertiesPage({ searchParams }: CalendarPropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const ownerId = resolvedSearchParams.ownerId;

  const today = todayISO();
  const { properties, owner, error } = await getProperties(today, addDays(today, 90), ownerId);

  if (error || (ownerId && !owner)) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-500/10 bg-gradient-to-b from-red-500/5 to-transparent p-8 text-center shadow-lg relative">
            {/* Background blur decorative circles */}
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
                  Liên kết không hợp lệ
                </h1>
                <p className="text-sm font-semibold text-neutral-500 leading-relaxed">
                  {error || "Link không hợp lệ hoặc đã bị thu hồi"}
                </p>
              </div>

              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 text-xs font-bold shadow-md shadow-teal-500/10 active:scale-95 transition-all outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Quay lại Trang chủ
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const areas = Array.from(new Set(properties.map((p) => p.area))).sort();

  // Updated label "HH:mm DD/MM/YYYY"
  const now = new Date();
  const updatedLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 flex flex-col gap-6">
        {owner && <OwnerBanner owner={owner} />}
        <HomeView
          properties={properties}
          areas={areas}
          today={today}
          updatedLabel={updatedLabel}
        />
      </main>
      <SiteFooter />
    </>
  );
}
