import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/dashboard", "/app/onboarding", "/app/coach", "/app/caii", "/app/roadmap", "/app/book", "/app/bridge", "/app/wins", "/api/"],
      },
    ],
    sitemap: "https://legacyforward.ai/sitemap.xml",
  };
}
