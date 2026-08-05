import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "How We Grow \u2014 Price Family Farm";

const TITLE = ["Intensive, container-based,", "hands on every day."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "How We Grow",
      title: TITLE,
      sub: "Greenhouse propagation, raised beds, and grow tents.",
    }),
    { ...size }
  );
}
