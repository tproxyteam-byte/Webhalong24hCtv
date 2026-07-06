import { getPropertiesByOwner } from "@/lib/api";
import { ZaloCalClientView } from "./zalo-cal-client-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ ownerId: string }>;
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

  return <ZaloCalClientView ownerId={ownerId} />;
}
