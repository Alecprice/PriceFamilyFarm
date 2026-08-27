import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Our Story — Price Family Farm";

const TITLE = ["One growing season,", "bare root to registered farm."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Our Story",
      title: TITLE,
      sub: "The season as it actually happened, month by month.",
    }),
    { ...size }
  );
}
