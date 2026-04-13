import type { MetadataRoute } from "next";
import { getSection, getAllSections, getFrameworkPillars, getBlogPosts } from "@/lib/content";

const BASE_URL = "https://legacyforward.ai";

const sectionHrefMap: Record<string, (slug: string) => string> = {
  blueprints: (slug) => `/library/toolkit/blueprints/${slug}`,
  "agentic-designs": (slug) => `/library/toolkit/agentic-designs/${slug}`,
  "genai-arch": (slug) => `/library/toolkit/genai-arch/${slug}`,
  "gcp-mle": (slug) => `/library/learn/gcp-mle/${slug}`,
  "gcp-mle-usecases": (slug) => `/library/learn/gcp-mle/usecases/${slug}`,
  "gcp-cdl": (slug) => `/library/learn/gcp-cdl/${slug}`,
  "gcp-gal": (slug) => `/library/learn/gcp-gal/${slug}`,
  "gcp-pca": (slug) => `/library/learn/gcp-pca/${slug}`,
  "gcp-pde": (slug) => `/library/learn/gcp-pde/${slug}`,
  genai: (slug) => `/library/learn/genai/${slug}`,
  "genai-usecases": (slug) => `/library/learn/genai/usecases/${slug}`,
  agenticai: (slug) => `/library/books/agenticai/${slug}`,
  "ai-enterprise-architect": (slug) => `/library/books/ai-enterprise-architect/${slug}`,
  "llm-ba-qa": (slug) => `/library/books/llm-ba-qa/${slug}`,
  "ai-pm": (slug) => `/library/books/ai-pm/${slug}`,
  "ai-leaders": (slug) => `/library/books/ai-leaders/${slug}`,
  "graph-ai": (slug) => `/library/books/graph-ai/${slug}`,
  cheatsheets: (slug) => `/library/cheatsheets/${slug}`,
};

const staticPages = [
  "/",
  "/framework",
  "/framework/signal-capture",
  "/framework/grounded-delivery",
  "/framework/legacy-coexistence",
  "/cheatsheet",
  "/about",
  "/blog",
  "/library",
  "/library/books",
  "/library/books/agenticai",
  "/library/books/ai-leaders",
  "/library/books/ai-pm",
  "/library/books/ai-enterprise-architect",
  "/library/books/llm-ba-qa",
  "/library/books/graph-ai",
  "/library/toolkit",
  "/library/toolkit/blueprints",
  "/library/toolkit/agentic-designs",
  "/library/toolkit/genai-arch",
  "/library/learn",
  "/library/learn/gcp-mle",
  "/library/learn/gcp-mle/usecases",
  "/library/learn/genai",
  "/library/learn/genai/usecases",
  "/library/learn/gcp-cdl",
  "/library/learn/gcp-gal",
  "/library/learn/gcp-pca",
  "/library/learn/gcp-pde",
  "/library/cheatsheets",
  "/app",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static / hub pages
  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      changeFrequency: "weekly",
      priority: page === "/" ? 1.0 : 0.8,
    });
  }

  // Framework pillars
  for (const item of getFrameworkPillars()) {
    if (!item.meta.slug) continue;
    entries.push({
      url: `${BASE_URL}/framework/${item.meta.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Blog posts
  for (const item of getBlogPosts()) {
    if (!item.meta.slug) continue;
    entries.push({
      url: `${BASE_URL}/blog/${item.meta.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Library content pages
  const sections = getAllSections();
  for (const section of sections) {
    const hrefFn = sectionHrefMap[section];
    if (!hrefFn) continue;

    const items = getSection(section);
    for (const item of items) {
      if (!item.meta.slug) continue;
      entries.push({
        url: `${BASE_URL}${hrefFn(item.meta.slug)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
