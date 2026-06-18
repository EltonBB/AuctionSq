"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string | null;
  fallbackClassName?: string;
  iconClassName?: string;
}

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackSrc = "/brand/home-feature-product.png",
  fallbackClassName = "",
  iconClassName = "h-5 w-5",
}: SafeImageProps) {
  const [failedCompletely, setFailedCompletely] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const safeSrc = typeof src === "string" && src.trim().length > 0 ? src : null;
  const safeFallback = typeof fallbackSrc === "string" && fallbackSrc.trim().length > 0 ? fallbackSrc : null;
  const displaySrc = useFallback || !safeSrc ? safeFallback : safeSrc;

  useEffect(() => {
    setFailedCompletely(false);
    setUseFallback(false);
  }, [src, fallbackSrc]);

  if (!displaySrc || failedCompletely) {
    return (
      <div
        className={`flex items-center justify-center border border-[#f0d9c4] bg-[#FFF8F1] text-[#c38a5b] ${className} ${fallbackClassName}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <ImageOff className={iconClassName} aria-hidden="true" />
        <span className="sr-only">Pa imazh</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!useFallback && safeFallback && displaySrc !== safeFallback) {
          setUseFallback(true);
          return;
        }
        setFailedCompletely(true);
      }}
    />
  );
}
