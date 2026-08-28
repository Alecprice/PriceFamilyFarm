"use client";

import Image from "next/image";
import { useLightbox } from "./Lightbox";

export default function GalleryImage({ src, alt }) {
  const open = useLightbox();
  return (
    <button
      type="button"
      onClick={() => open(src, alt)}
      className="gal-figure gal-trigger"
      aria-label={`Open larger photo: ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 620px) 50vw, (max-width: 900px) 33vw, 25vw"
        style={{ objectFit: "cover" }}
      />
    </button>
  );
}
