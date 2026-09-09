"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

const PLACEHOLDER = "/images/placeholder-pending-car.svg";

function needsUnoptimized(src: string): boolean {
  return (
    src.includes(".svg") ||
    src.startsWith("data:") ||
    src.includes("placeholder-pending-car")
  );
}

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
};

/**
 * next/image con fallback a placeholder si la URL falla (Blob 404, ruta local rota).
 */
export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  quality = 85,
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = asset(failed || !src ? PLACEHOLDER : src);
  const unoptimized = needsUnoptimized(resolved);

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      unoptimized={unoptimized}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
