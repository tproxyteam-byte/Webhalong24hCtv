import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/command-palette";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Webhalong24h Sale — Lịch & giá CTV các căn Hạ Long",
  description:
    "Tra cứu nhanh lịch trống, ảnh và giá CTV của tất cả các căn villa/homestay tại Vịnh Hạ Long. Dành cho sale Webhalong24h.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
        <CommandPalette />
        <Toaster
          position="top-center"
          duration={2400}
          toastOptions={{
            classNames: {
              toast:
                "!rounded-lg !border !border-neutral-200 !bg-white !text-neutral-900 !shadow-[var(--shadow-pop)]",
              title: "!text-sm !font-medium",
              description: "!text-xs !text-neutral-500",
            },
          }}
        />
      </body>
    </html>
  );
}
