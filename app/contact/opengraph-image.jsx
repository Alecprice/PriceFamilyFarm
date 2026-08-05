import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Contact \u2014 Price Family Farm";

const TITLE = ["Get in touch."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Contact",
      title: TITLE,
      sub: "Questions about produce, plant starts, or visiting the farm.",
    }),
    { ...size }
  );
}
