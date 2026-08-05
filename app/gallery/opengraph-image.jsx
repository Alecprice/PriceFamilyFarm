import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Gallery \u2014 Price Family Farm";

const TITLE = ["A season on the farm,", "February through June."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Gallery",
      title: TITLE,
      sub: "Unfiltered progress shots from the first year.",
    }),
    { ...size }
  );
}
