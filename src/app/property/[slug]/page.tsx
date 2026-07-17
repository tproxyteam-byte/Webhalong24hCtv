import { cookies } from "next/headers";
import { getPropertyDetail } from "@/lib/api";
import { PropertyClientView } from "./property-client-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ 
    id?: string | string[];
    ownerId?: string | string[];
    from?: string | string[];
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const propertyId = typeof query.id === "string" ? query.id : undefined;
  const property = await getPropertyDetail(slug, propertyId);
  if (!property) return { title: "Căn không tồn tại — Webhalong24h Sale" };
  return {
    title: `${property.name} — ${property.building} | Webhalong24h Sale`,
    description: property.description.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

function getOwnerIdFromToken(token: string): string | undefined {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    
    const keys = ["ownerId", "id", "userId", "sub"];
    for (const key of keys) {
      if (decoded[key] && typeof decoded[key] === "string") {
        return decoded[key];
      }
    }
  } catch (e) {
    console.error("Failed to decode token:", e);
  }
  return undefined;
}

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const propertyId = typeof query.id === "string" ? query.id : undefined;
  const ownerId = typeof query.ownerId === "string" ? query.ownerId : undefined;
  const from = typeof query.from === "string" ? query.from : undefined;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  let loggedInOwnerId: string | undefined;
  if (accessToken) {
    loggedInOwnerId = getOwnerIdFromToken(accessToken);
  }
  const cookieOwnerId = cookieStore.get("lastOwnerId")?.value;
  const activeOwnerId = ownerId || loggedInOwnerId || cookieOwnerId;

  return (
    <PropertyClientView
      slug={slug}
      propertyId={propertyId}
      activeOwnerId={activeOwnerId}
      from={from}
    />
  );
}
