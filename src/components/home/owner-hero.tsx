"use client";

import { toast } from "sonner";
import type { PublicOwner } from "@/lib/api";

interface OwnerHeroProps {
  owner: PublicOwner;
  roomCount: number;
}

function ownerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function OwnerHero({ owner, roomCount }: OwnerHeroProps) {
  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link chia sẻ thành công!");
    } catch (err) {
      toast.error("Không thể sao chép link.");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-200/50 bg-gradient-to-r from-teal-50/20 via-white/90 to-indigo-50/20 backdrop-blur-md p-5 shadow-sm sm:p-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative shrink-0">
          {owner.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={owner.avatarUrl}
              alt={owner.name}
              width={60}
              height={60}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm border border-neutral-200/30"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-900 text-base font-extrabold text-white shadow-md border border-neutral-200/20"
            >
              {ownerInitials(owner.name)}
            </span>
          )}
          <span
            aria-hidden
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm translate-x-0.5 translate-y-0.5"
          />
        </div>

        <div className="min-w-0 flex flex-col items-start gap-1">
          <div className="inline-flex items-center gap-1 rounded-full bg-teal-50/60 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-100/30">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Chủ phòng liên kết
          </div>
          <h1 className="truncate text-lg font-black tracking-tight text-neutral-900 sm:text-xl capitalize leading-none">
            {owner.name}
          </h1>
          <p className="text-[11px] font-medium text-neutral-400 leading-tight">
            Chia sẻ quỹ phòng và tình trạng trực tiếp với Sale Agent
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 rounded-xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer outline-none shadow-sm hover:shadow-[0_4px_12px_rgba(13,148,136,0.05)] shrink-0 self-start sm:self-center"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Sao chép Link chia sẻ
      </button>
    </section>
  );
}
