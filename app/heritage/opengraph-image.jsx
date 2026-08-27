import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Heritage — Price Family Farm";

const TITLE = ["Two hundred and fifty years", "of farming this valley."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Heritage",
      title: TITLE,
      sub: "Greene County's history, and its cash crops, era by era.",
    }),
    { ...size }
  );
}
