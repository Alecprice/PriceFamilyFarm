const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://price-family-farm.alecjprice.com";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/farm-records", "/funding", "/privacy-tools"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
