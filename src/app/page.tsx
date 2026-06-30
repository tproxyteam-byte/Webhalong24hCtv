import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { redirect } from "next/navigation";
import { getProperties, getPropertiesByOwner, type PublicOwner } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";
import type { Property } from "@/lib/types";

export const dynamic = "force-dynamic";
import { OwnerHero } from "@/components/home/owner-hero";

interface PageProps {
  searchParams: Promise<{ ownerId?: string; owner?: string; all?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ownerId = params.ownerId || params.owner;

  const defaultOwnerId = "e984db01-5eaf-478c-b066-c3fd47c522a2";

  if (!ownerId && params.all !== "true") {
    redirect(`/?ownerId=${defaultOwnerId}`);
  }

  const today = todayISO();
  let properties: Property[] = [];
  let owner: PublicOwner | null = null;
  let ownerNotFound = false;

  if (ownerId === "all" || params.all === "true") {
    properties = await getProperties(today, addDays(today, 90));
  } else {
    // If ownerId is present (or after redirect), fetch it
    const activeOwnerId = ownerId && typeof ownerId === "string" ? ownerId : defaultOwnerId;
    const result = await getPropertiesByOwner(activeOwnerId, today, addDays(today, 90));
    if (result) {
      properties = result.properties;
      owner = result.owner;
    } else {
      ownerNotFound = true;
    }
  }

  const areas = Array.from(new Set(properties.map((p) => p.area))).sort();

  // Updated label "HH:mm DD/MM/YYYY"
  const now = new Date();
  const updatedLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  return (
    <>
      <SiteHeader subtitle={owner ? `Chủ nhà · ${owner.name}` : undefined} />
      <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {owner && <OwnerHero owner={owner} roomCount={properties.length} />}

        {ownerNotFound ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-red-200 bg-red-50/50 px-6 py-16 text-center">
            <p className="text-lg font-bold text-red-800">Không tìm thấy thông tin chủ nhà</p>
            <p className="text-sm text-neutral-500">
              Mã chủ nhà (ownerId: &ldquo;{ownerId}&rdquo;) không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
            </p>
          </div>
        ) : (
          <HomeView
            properties={properties}
            areas={areas}
            today={today}
            updatedLabel={updatedLabel}
          />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
