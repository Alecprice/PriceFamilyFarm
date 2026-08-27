import { ImageResponse } from "next/og";
import { ogElement, ogSize, ogContentType } from "@/lib/ogImage";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Recipes — Price Family Farm";

const TITLE = ["What we actually cook", "with what comes off the farm."];

export default async function Image() {
  return new ImageResponse(
    ogElement({
      eyebrow: "Recipes",
      title: TITLE,
      sub: "44 recipes, every one with a one-click grocery list.",
    }),
    { ...size }
  );
}
