import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { SAMPLE_PROPERTIES, listAreas } from "@/lib/sample-properties";
import { todayISO } from "@/lib/format";

export default function HomePage() {
  // TODO: thay bằng `GET /properties/sale` từ NestJS BE
  const properties = SAMPLE_PROPERTIES;
  const areas = listAreas();
  const today = todayISO();

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
