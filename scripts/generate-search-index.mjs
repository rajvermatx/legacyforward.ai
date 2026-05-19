#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content");
const frameworkDir = path.join(root, "framework");
const outPath = path.join(root, "public", "search-index.json");

// Maps content section name → href builder for /library/... paths
const sectionHrefMap = {
  // Toolkit
  blueprints: (slug) => `/library/toolkit/blueprints/${slug}`,
  "agentic-designs": (slug) => `/library/toolkit/agentic-designs/${slug}`,
  "genai-arch": (slug) => `/library/toolkit/genai-arch/${slug}`,
  // Learn
  "gcp-mle": (slug) => `/library/learn/gcp-mle/${slug}`,
  "gcp-mle-usecases": (slug) => `/library/learn/gcp-mle/usecases/${slug}`,
  "gcp-cdl": (slug) => `/library/learn/gcp-cdl/${slug}`,
  "gcp-gal": (slug) => `/library/learn/gcp-gal/${slug}`,
  "gcp-pca": (slug) => `/library/learn/gcp-pca/${slug}`,
  "gcp-pde": (slug) => `/library/learn/gcp-pde/${slug}`,
  genai: (slug) => `/library/learn/genai/${slug}`,
  "genai-usecases": (slug) => `/library/learn/genai/usecases/${slug}`,
  // Books
  "building-agentic-ai-systems": (slug) => `/library/books/building-agentic-ai-systems/${slug}`,
  "architecting-ai-real-enterprise": (slug) => `/library/books/architecting-ai-real-enterprise/${slug}`,
  "ai-for-analysts-and-qa": (slug) => `/library/books/ai-for-analysts-and-qa/${slug}`,
  "knowledge-graphs-enterprise-ai": (slug) => `/library/books/knowledge-graphs-enterprise-ai/${slug}`,
  "building-ai-products-that-ship": (slug) => `/library/books/building-ai-products-that-ship/${slug}`,
  "leading-ai-real-enterprise": (slug) => `/library/books/leading-ai-real-enterprise/${slug}`,
  "the-stack-beneath-the-signal": (slug) => `/library/books/the-stack-beneath-the-signal/${slug}`,
  "ai-beyond-the-demo-guide": (slug) => `/library/books/ai-beyond-the-demo-guide/${slug}`,
  "beyond-llms-large-concept-models": (slug) => `/library/books/beyond-llms-large-concept-models/${slug}`,
  "ai-beyond-the-demo": (slug) => `/library/books/ai-beyond-the-demo/${slug}`,
  // Cheatsheets
  cheatsheets: (slug) => `/library/cheatsheets/${slug}`,
  // Static (skipped intentionally — see legacyforward-guide, substack)
  static: (slug) => `/${slug}`,
};

const entries = [];

// Index library content from /content/
if (fs.existsSync(contentDir)) {
  const sections = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const section of sections) {
    const dir = path.join(contentDir, section);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      if (file === "_meta.json") continue;

      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);

      if (!data.slug) continue;

      const hrefFn = sectionHrefMap[section];
      if (!hrefFn) {
        console.warn(`Unknown section "${section}", skipping ${file}`);
        continue;
      }

      entries.push({
        title: data.title || "",
        slug: data.slug,
        section: data.section || section,
        description: data.description || "",
        href: hrefFn(data.slug),
        ...(data.tags && Array.isArray(data.tags) ? { tags: data.tags } : {}),
      });
    }
  }
}

// Also index framework pillars from /framework/
if (fs.existsSync(frameworkDir)) {
  const files = fs.readdirSync(frameworkDir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(frameworkDir, file), "utf-8");
    const { data } = matter(raw);
    if (!data.slug) continue;
    entries.push({
      title: data.title || "",
      slug: data.slug,
      section: "framework",
      description: data.description || "",
      href: `/framework/${data.slug}`,
      ...(data.tags && Array.isArray(data.tags) ? { tags: data.tags } : {}),
    });
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log(`Wrote ${entries.length} entries to ${outPath}`);
