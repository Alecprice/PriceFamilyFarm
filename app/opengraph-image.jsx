import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Est. 2026 · Greene County, TN — Price Family Farm";

const TITLE = ["Growing something real", "in East Tennessee."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Est. 2026 · Greene County, TN",
      title: TITLE,
      sub: "A family orchard, greenhouse, and market garden in Greeneville, TN.",
    }),
    { ...size }
  );
}
