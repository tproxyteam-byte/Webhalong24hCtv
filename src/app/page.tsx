import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { getProperties } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = todayISO();
  const properties = await getProperties(today, addDays(today, 90));
  const areas = Array.from(new Set(properties.map((p) => p.area))).sort();

  // Updated label "HH:mm DD/MM/YYYY"
  const now = new Date();
  const updatedLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
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
