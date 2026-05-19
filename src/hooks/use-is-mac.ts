"use client";

import { useSyncExternalStore } from "react";

/**
 * Trả về true nếu user agent là Mac. SSR-safe và không gây cascading re-render
 * (tránh lỗi react-hooks/set-state-in-effect trên React 19).
 *
 * Hook đọc navigator qua useSyncExternalStore với getServerSnapshot trả về `false`
 * để tránh hydration mismatch khi render trên server.
 */
function subscribe(): () => void {
  // navigator.platform/userAgent không đổi trong runtime — không cần listen event.
  return () => {};
}

function getSnapshot(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac/i.test(navigator.platform || navigator.userAgent);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
