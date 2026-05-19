interface PropertyGalleryProps {
  images: string[];
  alt: string;
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [hero, ...rest] = images;
  const sideImages = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-cream-100 sm:col-span-2 sm:row-span-2 ar-43 sm:aspect-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
      {sideImages.map((src, idx) => (
        <div
          key={idx}
          className="relative hidden overflow-hidden rounded-xl bg-cream-100 sm:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${alt} — ảnh ${idx + 2}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}

      {/* Mobile horizontal strip */}
      {sideImages.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:hidden">
          {sideImages.map((src, idx) => (
            <div
              key={idx}
              className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} — ảnh ${idx + 2}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
