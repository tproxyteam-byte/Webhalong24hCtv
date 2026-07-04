"use client";

import { useState, useEffect } from "react";

interface OwnerBannerProps {
  owner: {
    id: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}

export function OwnerBanner({ owner }: OwnerBannerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (owner?.id) {
      document.cookie = `lastOwnerId=${owner.id}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [owner?.id]);

  // Generate initials for avatar placeholder
  const initials = owner.name
    ? owner.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CN";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/properties/public/by-owner/${owner.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-teal-500/10 bg-gradient-to-r from-teal-500/5 via-teal-600/5 to-indigo-500/5 p-6 md:p-8 shadow-sm">
      {/* Background soft glowing blobs */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            {owner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={owner.avatarUrl}
                alt={owner.name}
                className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-md md:h-20 md:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-tr from-teal-600 to-indigo-900 text-lg font-bold text-white shadow-md md:h-20 md:w-20">
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          {/* Info Details */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
              <span className="h-1 w-1 rounded-full bg-teal-500" />
              Chủ phòng liên kết
            </span>
            <h1 className="mt-1.5 text-xl font-black tracking-tight text-neutral-800 md:text-2xl">
              {owner.name}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500 font-semibold">
              Chia sẻ quỹ phòng và tình trạng trực tiếp với Sale Agent
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {owner.phone && (
            <>
              {/* Chat Zalo Button */}
              <a
                href={`https://zalo.me/${owner.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#0068ff] hover:bg-[#0054d1] text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all outline-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 5.58 2 10c0 2.22 1.08 4.23 2.87 5.67L4 19.5c-.13.38.22.73.58.58l3.92-1.63c1.09.35 2.27.55 3.5.55 5.52 0 10-3.58 10-8s-4.48-8-10-8zm1 11h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
                Zalo Gọi điện
              </a>

              {/* Call Phone Button */}
              <a
                href={`tel:${owner.phone}`}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-4 py-2.5 text-xs font-bold shadow-sm active:scale-95 transition-all outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {owner.phone}
              </a>
            </>
          )}

          {/* Copy link to share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl border border-teal-200/50 bg-teal-50/50 hover:bg-teal-50 text-teal-800 px-4 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer outline-none"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Đã sao chép!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Sao chép Link chia sẻ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
