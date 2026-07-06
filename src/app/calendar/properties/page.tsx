import { PropertiesClientView } from "./properties-client-view";

export const dynamic = "force-dynamic";

interface CalendarPropertiesPageProps {
  searchParams: Promise<{ ownerId?: string }>;
}

export default async function CalendarPropertiesPage({ searchParams }: CalendarPropertiesPageProps) {
  const resolvedSearchParams = await searchParams;

  return <PropertiesClientView searchParams={resolvedSearchParams} />;
}
