import fs from "fs";
import path from "path";
import matter from "gray-matter";

const frameworkDir = path.join(process.cwd(), "framework");
const contentDir = path.join(process.cwd(), "content");

export interface ContentMeta {
  title: string;
  slug: string;
  description: string;
  date?: string;
  pillar?: number;
  subtitle?: string;
  relatedPillar?: string;
}

export interface ContentItem {
  meta: ContentMeta;
  content: string;
}

function getContentFromDir(dir: string): ContentItem[] {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      meta: data as ContentMeta,
      content,
    };
  });
}

export function getFrameworkPillars(): ContentItem[] {
  return getContentFromDir(frameworkDir).sort(
    (a, b) => (a.meta.pillar ?? 0) - (b.meta.pillar ?? 0)
  );
}

export function getFrameworkBySlug(slug: string): ContentItem | undefined {
  return getFrameworkPillars().find((item) => item.meta.slug === slug);
}

export function getBlogPosts(): ContentItem[] {
  return getContentFromDir(contentDir).sort((a, b) => {
    const dateA = a.meta.date ?? "";
    const dateB = b.meta.date ?? "";
    return dateB.localeCompare(dateA);
  });
}

export function getBlogBySlug(slug: string): ContentItem | undefined {
  return getBlogPosts().find((item) => item.meta.slug === slug);
}

export function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 250);
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): TocEntry[] {
  const lines = content.split("\n");
  const headings: TocEntry[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
}
