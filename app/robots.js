const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://price-family-farm.alecjprice.com";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/farm-os",
        "/farm-today",
        "/farm-weekly-review",
        "/farm-records",
        "/farm-analytics",
        "/farm-planner",
        "/farm-calendar",
        "/farm-journal",
        "/timeline",
        "/farm-map",
        "/learn/garden-layout-builder",
        "/funding",
        "/privacy-tools",
        "/farm-backup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
