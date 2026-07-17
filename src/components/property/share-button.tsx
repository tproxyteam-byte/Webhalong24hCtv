"use client";

import { toast } from "sonner";

interface ShareButtonProps {
  propertyId: string;
  name: string;
}

/**
 * Link gửi khách → trỏ tới customer site Webhalong24hOnline (deploy preview.halong24h.com).
 * Slug căn dùng chung giữa web sale + customer site khi wire API thật.
 *
 * TODO: set env `NEXT_PUBLIC_CUSTOMER_SITE_URL=https://preview.halong24h.com` lúc deploy.
 */
const CUSTOMER_SITE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ?? "https://preview.halong24h.com";

export function ShareButton({ propertyId, name }: ShareButtonProps) {
  const handleClick = async () => {
    if (typeof window === "undefined") return;
    const url = `${CUSTOMER_SITE_URL}/${propertyId}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép link gửi khách", {
        description: url,
      });
    } catch {
      toast.error("Không thể sao chép link.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-ghost w-full"
    >
      Sao chép link gửi khách
    </button>
  );
}
