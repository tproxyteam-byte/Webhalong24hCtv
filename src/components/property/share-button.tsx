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
  process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ?? "https://webhalong24h.com";

export function ShareButton({ slug, name }: ShareButtonProps) {
  const handleClick = async () => {
    if (typeof window === "undefined") return;
    const url = `${CUSTOMER_SITE_URL}/property/${slug}`;
    const text = `${name}\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: name, url, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Đã sao chép link gửi khách", {
        description: url,
      });
    } catch {
      // user cancelled — no-op
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
