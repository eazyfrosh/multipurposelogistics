"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCarrier } from "@/lib/data/carriers";
import { getCarrierLogoSrc, DEFAULT_CARRIER_LOGO } from "@/lib/data/carrier-logos";

const RASTER_EXTENSION = /\.(png|jpe?g|webp|avif)$/i;

interface CarrierLogoProps {
  /** Carrier code (preferred, e.g. shipment.carrierCode) or display name. */
  carrier: string;
  /** Visual height in px; width follows automatically to preserve aspect ratio. Default 36. */
  size?: number;
  /** Drop the neutral background chip for dense/inline contexts (tables, chips). */
  bare?: boolean;
  className?: string;
}

/**
 * Renders a carrier's logo from /public/carriers, resolved by carrier code
 * or name, with automatic fallback to default.svg if no logo is mapped or
 * the file fails to load. SVGs render as plain <img> (vector, nothing for
 * next/image to optimize); raster formats go through next/image.
 */
export function CarrierLogo({ carrier, size = 36, bare = false, className }: CarrierLogoProps) {
  const def = getCarrier(carrier);
  const resolvedSrc = getCarrierLogoSrc(def.code);
  const [src, setSrc] = useState(resolvedSrc);

  useEffect(() => setSrc(resolvedSrc), [resolvedSrc]);

  const isRaster = RASTER_EXTENSION.test(src);
  const innerHeight = bare ? size : Math.max(12, size - 12);
  const alt = `${def.name} logo`;

  const image = isRaster ? (
    <Image
      src={src}
      alt={alt}
      width={innerHeight * 3}
      height={innerHeight}
      loading="lazy"
      className="w-auto object-contain"
      style={{ height: innerHeight, width: "auto" }}
      onError={() => setSrc(DEFAULT_CARRIER_LOGO)}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-auto object-contain"
      style={{ height: innerHeight }}
      onError={() => setSrc(DEFAULT_CARRIER_LOGO)}
    />
  );

  if (bare) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)} style={{ height: size }}>
        {image}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-black/5",
        className
      )}
      style={{ height: size }}
    >
      {image}
    </span>
  );
}
