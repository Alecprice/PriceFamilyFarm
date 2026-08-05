const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

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
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
