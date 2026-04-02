"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: true,
  });
  const [current, setCurrent] = React.useState(initialIndex);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [emblaApi]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {current + 1} / {images.length}
        </div>
      )}

      <div
        className="w-full max-w-4xl px-4 sm:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((url, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] flex items-center justify-center"
              >
                <Image
                  src={url}
                  alt={`image ${i + 1}`}
                  width={1200}
                  height={900}
                  className="object-contain max-h-[85vh] w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollPrev();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollNext();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollTo(i);
              }}
              className={`w-2 h-2 rounded-full transition ${
                i === current ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
