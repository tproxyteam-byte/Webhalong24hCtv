"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/components/command-palette";
import { useIsMac } from "@/hooks/use-is-mac";

interface SiteHeaderProps {
  showBack?: boolean;
  subtitle?: string;
  showFavoritesOnly?: boolean;
  onFavoritesToggle?: () => void;
  favoritesCount?: number;
}

export function SiteHeader({
  showBack = false,
  subtitle,
  showFavoritesOnly = false,
  onFavoritesToggle,
  favoritesCount = 0,
}: SiteHeaderProps) {
  const isMac = useIsMac();
  const [displayName, setDisplayName] = useState("Sale Agent");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleAuthCheck = () => {
      const path = window.location.pathname;
      const isPublicPath = path.startsWith("/zalo-cal") || path.startsWith("/login");

      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((c) => c.startsWith("username="));
      const hasUser = userCookie && userCookie.split("=")[1];

      if (!hasUser) {
        setIsLoggedIn(false);
        if (!isPublicPath) {
          window.location.replace("/login");
          return;
        }
      } else {
        setIsLoggedIn(true);
        const decoded = decodeURIComponent(userCookie.split("=")[1]);
        const name = decoded.includes("@") ? decoded.split("@")[0] : decoded;
        setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };

    handleAuthCheck();

    window.addEventListener("pageshow", handleAuthCheck);
    return () => {
      window.removeEventListener("pageshow", handleAuthCheck);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout request failed");
      document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
      setIsLoggingOut(false);
    }
  };

  const initials = displayName.substring(0, 2).toUpperCase();

  const openPalette = () =>
    window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT));

  const stubAction = (label: string) =>
    toast(label, { description: "Tính năng đang phát triển." });

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 group">
          {showBack && (
            <span aria-hidden className="mr-1 text-neutral-500 transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          )}
          <span className="rounded-md bg-gradient-to-r from-teal-600 to-teal-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            Sale
          </span>
          {subtitle && (
            <span className="ml-3 hidden max-w-[200px] truncate text-sm font-medium text-neutral-400 lg:inline">
              · {subtitle}
            </span>
          )}
        </Link>

        {/* Desktop: expanded search bar | Mobile: icon-only */}
        <button
          type="button"
          onClick={openPalette}
          aria-label="Tìm căn nhanh"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 transition-all hover:bg-neutral-100 sm:h-10 sm:w-auto sm:max-w-2xl sm:flex-1 sm:gap-2.5 sm:rounded-xl sm:border sm:border-neutral-200/80 sm:bg-white sm:px-4 sm:text-sm sm:shadow-sm sm:hover:border-teal-300 sm:hover:bg-white sm:hover:shadow-[0_4px_12px_rgba(13,148,136,0.05)]"
        >
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-teal-600"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5 14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden flex-1 truncate text-left text-neutral-400 font-medium sm:inline">
            Tìm theo tên căn…
          </span>
          <kbd className="hidden h-5 shrink-0 items-center rounded-md border border-neutral-200 bg-neutral-50 px-1.5 font-mono text-[9px] font-semibold text-neutral-400 sm:inline-flex">
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
          <div className="relative inline-flex">
            <IconButton
              ariaLabel="Yêu thích"
              onClick={onFavoritesToggle || (() => stubAction("Căn yêu thích"))}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill={showFavoritesOnly ? "currentColor" : "none"}
                className={showFavoritesOnly ? "text-rose-500" : "text-neutral-600"}
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
            {favoritesCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white pointer-events-none">
                {favoritesCount}
              </span>
            )}
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              title="Đăng xuất"
              className="ml-1 flex items-center gap-2 rounded-full bg-white p-1 pr-1.5 sm:border sm:border-neutral-200/80 sm:pr-3.5 shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer outline-none"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-teal-700 to-indigo-900 text-[10px] font-bold text-white shadow-sm"
              >
                {initials}
              </span>
              <div className="hidden flex-col items-start leading-none sm:flex text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  Xin chào,
                </span>
                <span className="mt-0.5 text-xs font-bold text-neutral-800">
                  {displayName}
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all outline-none"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
    {showLogoutDialog && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 px-4 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isLoggingOut) {
            setShowLogoutDialog(false);
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 id="logout-dialog-title" className="mt-4 text-lg font-bold text-neutral-900">
            Đăng xuất khỏi hệ thống?
          </h2>
          <p id="logout-dialog-description" className="mt-2 text-sm leading-6 text-neutral-500">
            Bạn sẽ cần đăng nhập lại để tiếp tục xem lịch và giá dành cho Sale.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutDialog(false)}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="min-w-28 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
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
