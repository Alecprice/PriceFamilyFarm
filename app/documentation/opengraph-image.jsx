import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Documentation — Price Family Farm";

const TITLE = ["Becoming an official", "Tennessee family farm."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Documentation",
      title: TITLE,
      sub: "The paper trail behind Price Family Farm.",
    }),
    { ...size }
  );
}
