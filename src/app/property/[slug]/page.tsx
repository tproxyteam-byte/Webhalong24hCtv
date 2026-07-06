import { getPropertyDetail } from "@/lib/api";
import { PropertyClientView } from "./property-client-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyDetail(slug);
  if (!property) return { title: "Căn không tồn tại — Webhalong24h Sale" };
  return {
    title: `${property.name} — ${property.building} | Webhalong24h Sale`,
    description: property.description.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <PropertyClientView slug={slug} />;
}
