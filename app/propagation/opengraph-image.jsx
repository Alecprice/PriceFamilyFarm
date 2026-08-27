import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Propagation & Grafting — Price Family Farm";

const TITLE = ["How we multiply", "what already works."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Propagation & Grafting",
      title: TITLE,
      sub: "Grafting, seed saving, and overwintering, done right.",
    }),
    { ...size }
  );
}
