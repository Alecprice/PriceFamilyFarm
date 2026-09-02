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
        "/weekly-work-sheet",
        "/farm-records",
        "/farm-analytics",
        "/crop-profitability",
        "/farm-inventory",
        "/farm-data-health",
        "/plantings",
        "/market-planner",
        "/learn/garden-layout-builder",
        "/funding",
        "/privacy-tools",
        "/farm-backup",
        "/my-growing-journey",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
