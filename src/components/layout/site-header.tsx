"use client";

import Link from "next/link";
import { toast } from "sonner";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/components/command-palette";
import { useIsMac } from "@/hooks/use-is-mac";

interface SiteHeaderProps {
  showBack?: boolean;
  subtitle?: string;
}

export function SiteHeader({ showBack = false, subtitle }: SiteHeaderProps) {
  const isMac = useIsMac();

  const openPalette = () =>
    window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT));

  const stubAction = (label: string) =>
    toast(label, { description: "Tính năng đang phát triển." });

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          {showBack && (
            <span aria-hidden className="mr-1 text-neutral-500">
              ←
            </span>
          )}
          <span className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
            Webhalong24h
          </span>
          <span className="rounded-md bg-[var(--color-booked-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-booked-fg)]">
            Sale
          </span>
          {subtitle && (
            <span className="ml-3 hidden truncate text-sm text-neutral-500 lg:inline">
              · {subtitle}
            </span>
          )}
        </Link>

        {/* Desktop: expanded search bar | Mobile: icon-only */}
        <button
          type="button"
          onClick={openPalette}
          aria-label="Tìm căn nhanh"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100 sm:h-10 sm:w-auto sm:max-w-2xl sm:flex-1 sm:gap-2 sm:rounded-full sm:border sm:border-neutral-200 sm:px-4 sm:text-sm sm:hover:bg-white sm:hover:border-neutral-300"
        >
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-neutral-400"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5 14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden flex-1 truncate text-left sm:inline">
            Tìm theo tên căn, tòa nhà, địa chỉ…
          </span>
          <kbd className="hidden h-5 shrink-0 items-center rounded border border-neutral-200 bg-white px-1.5 font-mono text-[10px] font-medium text-neutral-500 sm:inline-flex">
            {isMac ? "⌘" : "Ctrl"} + K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            ariaLabel="Thông báo"
            onClick={() => stubAction("Thông báo")}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M5 8a5 5 0 0 1 10 0v3l1.5 2.5h-13L5 11V8z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8 15a2 2 0 0 0 4 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
          <div className="hidden sm:inline-flex">
            <IconButton
              ariaLabel="Yêu thích"
              onClick={() => stubAction("Căn yêu thích")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M10 17s-6.5-3.6-6.5-8.2A3.3 3.3 0 0 1 10 6a3.3 3.3 0 0 1 6.5 2.8C16.5 13.4 10 17 10 17z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </div>

          <div className="ml-1 flex items-center gap-2 rounded-full bg-white p-1 sm:border sm:border-neutral-200 sm:pr-3">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white"
            >
              MA
            </span>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Xin chào,
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                Minh Anh
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      {children}
    </button>
  );
}
