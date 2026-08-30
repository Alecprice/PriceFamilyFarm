import { FARM_CROPS } from "@/lib/farmData";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://price-family-farm.alecjprice.com";

export const dynamic = "force-static";

export default function sitemap() {
  const routes = [
    "",
    "/our-story",
    "/what-we-grow",
    "/how-we-grow",
    "/growing-guide",
    "/propagation",
    "/recipes",
    "/heritage",
    "/documentation",
    "/gallery",
    "/available",
    "/weather",
    "/contact",

    "/learn",
    "/learn/bugs",
    "/learn/garden-planning",
    "/learn/permaculture",
    "/learn/plant-diseases",
    "/learn/year-round",
  ];

  const cropRoutes = FARM_CROPS.map((crop) => `/crops/${crop.slug}`);

  return [...routes, ...cropRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "/available" || route === "/weather"
        ? "daily"
        : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/available"
          ? 0.9
          : route.startsWith("/crops/")
            ? 0.8
            : 0.7,
  }));
}
