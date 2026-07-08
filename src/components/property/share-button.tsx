"use client";

import { toast } from "sonner";

interface ShareButtonProps {
  slug: string;
  name: string;
}

/**
 * Link gửi khách → trỏ tới customer site Webhalong24hOnline (deploy webhalong24h.com).
 * Slug căn dùng chung giữa web sale + customer site khi wire API thật.
 *
 * TODO: set env `NEXT_PUBLIC_CUSTOMER_SITE_URL=https://webhalong24h.com` lúc deploy.
 */
const CUSTOMER_SITE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ?? "https://preview.halong24h.com";

export function ShareButton({ slug, name }: ShareButtonProps) {
  const handleClick = async () => {
    if (typeof window === "undefined") return;
    const url = `${CUSTOMER_SITE_URL}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Đã sao chép link gửi khách", {
        description: url,
      });
    } catch (err) {
      console.error(err);
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
