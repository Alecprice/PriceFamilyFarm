"use client";

import Image from "next/image";
import { useLightbox } from "./Lightbox";

export default function GalleryImage({ src, alt }) {
  const open = useLightbox();
  return (
    <figure onClick={() => open(src, alt)} className="gal-figure">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 620px) 50vw, (max-width: 900px) 33vw, 25vw"
        style={{ objectFit: "cover" }}
      />
    </figure>
  );
}
