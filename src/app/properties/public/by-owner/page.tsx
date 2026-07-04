import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ByOwnerRootPage() {
  const cookieStore = await cookies();
  const lastOwnerId = cookieStore.get("lastOwnerId")?.value;
  const targetOwnerId = lastOwnerId || "e984db01-5eaf-478c-b066-c3fd47c522a2";
  redirect(`/calendar/properties?ownerId=${targetOwnerId}`);
}
