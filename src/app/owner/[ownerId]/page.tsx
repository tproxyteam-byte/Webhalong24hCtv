import { redirect } from "next/navigation";

interface OwnerPageProps {
  params: Promise<{ ownerId: string }>;
}

export default async function LegacyOwnerPage({ params }: OwnerPageProps) {
  const { ownerId } = await params;
  redirect(`/properties/public/by-owner/${ownerId}`);
}
