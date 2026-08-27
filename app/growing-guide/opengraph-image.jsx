import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Growing Guide — Price Family Farm";

const TITLE = ["What actually works,", "growing in East Tennessee."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Growing Guide",
      title: TITLE,
      sub: "A planting calendar built for Greene County's climate.",
    }),
    { ...size }
  );
}
