"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeView } from "@/components/home/home-view";
import { getPropertiesByOwner, type PublicOwner, type OwnerPropertiesResult } from "@/lib/api";
import { addDays, todayISO } from "@/lib/format";
import { useFavorites } from "@/hooks/use-favorites";

interface ZaloCalClientViewProps {
  ownerId: string;
}

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function ownerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ZaloCalClientView({ ownerId }: ZaloCalClientViewProps) {
  const { favorites } = useFavorites();
  const [data, setData] = useState<OwnerPropertiesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [today, setToday] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      setIsError(false);
      try {
        const clientToday = todayISO();
        const clientEnd = addDays(clientToday, 90);
        const result = await getPropertiesByOwner(ownerId, clientToday, clientEnd);
        if (!active) return;
        if (!result) {
          setIsError(true);
        } else {
          setData(result);
          
          const now = new Date();
          const label = `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
            now.getMonth() + 1
          ).padStart(2, "0")}/${now.getFullYear()}`;
          setUpdatedLabel(label);
          setToday(clientToday);
        }
      } catch (err) {
        console.error("Error loading owner Zalo cal on client:", err);
        if (active) {
          setIsError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [ownerId]);

  if (isLoading) {
    return (
      <>
        <SiteHeader
          subtitle="Đang tải..."
          favoritesCount={favorites.length}
          onFavoritesToggle={() => {
            window.location.href = "/calendar/properties?favorites=true";
          }}
        />
        <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-teal-600"></div>
            <p className="text-sm font-semibold text-neutral-500 animate-pulse">Đang tải lịch phòng chủ nhà...</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (isError || !data) {
    notFound();
  }

  const { owner, properties } = data;
  const areas = Array.from(new Set(properties.map((p) => p.area))).sort();

  return (
    <>
      <SiteHeader
        subtitle={`Lịch phòng · ${owner.name}`}
        favoritesCount={favorites.length}
        onFavoritesToggle={() => {
          window.location.href = "/calendar/properties?favorites=true";
        }}
      />
      <main className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <OwnerHero owner={owner} roomCount={properties.length} />

        {properties.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
            <p className="text-h2">Chưa có phòng nào được công khai</p>
            <p className="text-sm text-neutral-500">
              Chủ nhà chưa mở lịch phòng nào. Vui lòng liên hệ trực tiếp để được hỗ trợ.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <HomeView
              properties={properties}
              areas={areas}
              today={today}
              updatedLabel={updatedLabel}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function OwnerHero({
  owner,
  roomCount,
}: {
  owner: PublicOwner;
  roomCount: number;
}) {
  const phone = owner.phone ? sanitizePhone(owner.phone) : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-tr from-teal-50/40 via-white to-neutral-50/40 p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {owner.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={owner.avatarUrl}
              alt={owner.name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-700 to-indigo-900 text-lg font-bold text-white shadow-sm ring-2 ring-white"
            >
              {ownerInitials(owner.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Lịch phòng chia sẻ qua Zalo
            </p>
            <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
              {owner.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {roomCount > 0 ? `${roomCount} căn đang mở lịch` : "Chủ nhà tại Halong24h"}
            </p>
          </div>
        </div>

        {phone && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={`https://zalo.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shadow-md shadow-teal-950/10 text-center"
              aria-label={`Nhắn Zalo cho ${owner.name}`}
            >
              Nhắn tin Zalo
            </a>
            <a
              href={`tel:${phone}`}
              className="btn text-center border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              aria-label={`Gọi điện cho ${owner.name}`}
            >
              Gọi {owner.phone}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
