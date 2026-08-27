import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "What We Grow — Price Family Farm";

const TITLE = ["Orchard fruit, vegetables,", "and plant starts."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "What We Grow",
      title: TITLE,
      sub: "Everything in active production at Price Family Farm.",
    }),
    { ...size }
  );
}
