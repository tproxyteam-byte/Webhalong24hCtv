"use client";

import { useState, useEffect, useRef } from "react";

interface PropertyGalleryProps {
  images: string[];
  alt: string;
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const navigateTo = (index: number) => {
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
  };

  const [hero, ...rest] = images;
  const sideImages = rest.slice(0, 4);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync scroll position instantly when opening the lightbox
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      const scrollToActive = () => {
        if (container.clientWidth > 0) {
          container.scrollTo({
            left: currentIndex * container.clientWidth,
            behavior: "instant",
          });
        } else {
          requestAnimationFrame(scrollToActive);
        }
      };
      
      requestAnimationFrame(scrollToActive);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowRight") {
        const nextIdx = (currentIndex + 1) % images.length;
        navigateTo(nextIdx);
      } else if (e.key === "ArrowLeft") {
        const prevIdx = (currentIndex - 1 + images.length) % images.length;
        navigateTo(prevIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / width);
      setMobileIndex(idx);
    }
  };

  const handleLightboxScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / width);
      if (idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  };

  return (
    <>
      {/* Desktop view (Grid Layout) */}
      <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-3">
        <div 
          onClick={() => openLightbox(0)}
          className="relative overflow-hidden rounded-2xl bg-cream-100 col-span-2 row-span-2 aspect-[4/3] ar-43 cursor-pointer group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {sideImages.map((src, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx + 1)}
            className="relative overflow-hidden rounded-xl bg-cream-100 cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${alt} — ảnh ${idx + 2}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Mobile view (Horizontal swipeable carousel of all images) */}
      <div className="relative w-full sm:hidden overflow-hidden rounded-2xl bg-cream-100 aspect-[4/3] ar-43">
        <div 
          className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
          onScroll={handleMobileScroll}
        >
          {images.map((src, idx) => (
            <div 
              key={idx}
              onClick={() => openLightbox(idx)}
              className="w-full h-full flex-shrink-0 snap-start snap-always cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} — ảnh ${idx + 1}`}
                className="h-full w-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        {/* Floating Page Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold select-none">
          {mobileIndex + 1} / {images.length}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md select-none transition-all duration-300"
          role="dialog"
          aria-modal="true"
        >
          {/* Top bar with count and close button */}
          <div className="flex items-center justify-between px-6 py-4 text-white z-10">
            <div className="text-sm font-semibold tracking-wide bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main scroll container of all images */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Prev Button */}
            <button
              onClick={() => navigateTo((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-4 md:left-6 z-10 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 md:bg-white/10 md:hover:bg-white/20 text-white transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center"
              aria-label="Ảnh trước"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Horizontal Scroll Area */}
            <div 
              ref={scrollContainerRef}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
              onScroll={handleLightboxScroll}
            >
              {images.map((src, idx) => (
                <div 
                  key={idx}
                  className="w-full h-full flex-shrink-0 snap-start snap-always flex items-center justify-center p-4 md:p-12"
                >
                  <div className="relative max-w-full max-h-[70vh] md:max-h-[75vh] flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${alt} - phóng to ${idx + 1}`}
                      className="max-w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-md shadow-2xl select-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => navigateTo((currentIndex + 1) % images.length)}
              className="absolute right-4 md:right-6 z-10 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 md:bg-white/10 md:hover:bg-white/20 text-white transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center"
              aria-label="Ảnh tiếp theo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Bottom strip / thumbnails */}
          <div className="pb-8 px-4 w-full max-w-4xl mx-auto hidden md:block">
            <div className="flex gap-2 overflow-x-auto justify-center py-2 px-1 scrollbar-none">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateTo(idx)}
                  className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 transition-all duration-200 border-2 ${
                    currentIndex === idx ? 'border-teal-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Thu nhỏ ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
