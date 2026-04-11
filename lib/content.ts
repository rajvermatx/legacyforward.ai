import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentItem, ContentMeta, TocEntry, SectionMeta } from "./types";

const frameworkDir = path.join(process.cwd(), "framework");
const blogDir = path.join(process.cwd(), "blog-content");
const contentBase = path.join(process.cwd(), "content");

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getContentFromDir(dir: string): ContentItem[] {
  if (!fs.existsSync(dir)) return [];
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

// ---------------------------------------------------------------------------
// Framework (existing legacyforward routes)
// ---------------------------------------------------------------------------

export function getFrameworkPillars(): ContentItem[] {
  return getContentFromDir(frameworkDir).sort(
    (a, b) => (a.meta.pillar ?? 0) - (b.meta.pillar ?? 0)
  );
}

export function getFrameworkBySlug(slug: string): ContentItem | undefined {
  return getFrameworkPillars().find((item) => item.meta.slug === slug);
}

// ---------------------------------------------------------------------------
// Blog (existing legacyforward routes — files moved to blog-content/)
// ---------------------------------------------------------------------------

export function getBlogPosts(): ContentItem[] {
  return getContentFromDir(blogDir).sort((a, b) => {
    const dateA = a.meta.date ?? "";
    const dateB = b.meta.date ?? "";
    return dateB.localeCompare(dateA);
  });
}

export function getBlogBySlug(slug: string): ContentItem | undefined {
  return getBlogPosts().find((item) => item.meta.slug === slug);
}

// ---------------------------------------------------------------------------
// Library sections (migrated from careeralign.com)
// ---------------------------------------------------------------------------

export function getSection(section: string): ContentItem[] {
  const dir = path.join(contentBase, section);
  return getContentFromDir(dir).sort(
    (a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0)
  );
}

export function getBySlug(section: string, slug: string): ContentItem | undefined {
  return getSection(section).find((item) => item.meta.slug === slug);
}

export function getSectionMeta(section: string): SectionMeta | null {
  const metaPath = path.join(contentBase, section, "_meta.json");
  if (!fs.existsSync(metaPath)) return null;
  return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as SectionMeta;
}

export function getAllSections(): string[] {
  if (!fs.existsSync(contentBase)) return [];
  return fs
    .readdirSync(contentBase, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// ---------------------------------------------------------------------------
// Content processing
// ---------------------------------------------------------------------------

/** Replace the first H1 heading with "## Overview" so the title isn't duplicated,
 *  merge standalone emoji lines into the following h4, and escape bare < for MDX. */
export function stripLeadingH1(content: string): string {
  const stripped = content.replace(/^\s*#\s+.+\n/, "\n## Overview\n");
  const merged = mergeEmojiHeadings(stripped);
  const tabled = convertComponentBreakdownToTable(merged);
  const captioned = formatImageCaptions(tabled);
  return escapeMdxChars(captioned);
}

/** Convert consecutive h4+paragraph pairs into a table wherever they appear.
 *  Matches 3+ consecutive "#### Title\n\nDescription" blocks. */
function convertComponentBreakdownToTable(content: string): string {
  return content.replace(
    /((?:#### .+\n\n[^\n#]+\n\n){3,})/gm,
    (block) => {
      const rows: string[] = [];
      const pattern = /#### (.+)\n\n([^\n]+)/g;
      let match;
      while ((match = pattern.exec(block)) !== null) {
        rows.push(`| ${match[1].trim()} | ${match[2].trim()} |`);
      }
      if (rows.length === 0) return block;
      return `| Component | Description |\n|-----------|-------------|\n${rows.join("\n")}\n\n`;
    }
  );
}

/** Convert a plain paragraph after an image into a bold italic line.
 *  Prose component styles em > strong as centered captions. */
function formatImageCaptions(content: string): string {
  return content.replace(
    /(!\[.*?\]\(.*?\))\n\n([A-Z][^\n]+)/gm,
    (_, img, caption) => `${img}\n\n_**${caption}**_`
  );
}

/** Merge a standalone emoji paragraph with the following #### heading.
 *  Turns "🔑\n\n#### Title" into "#### 🔑 Title" */
function mergeEmojiHeadings(content: string): string {
  return content.replace(
    /^([^\n]{1,2})\n\n(#{4}\s)/gm,
    (_, emoji, hashes) => `${hashes}${emoji} `
  );
}

/** Escape `<` in markdown so MDX doesn't interpret them as JSX tags.
 *  Preserves `<` inside fenced code blocks and inline code spans. */
export function escapeMdxChars(content: string): string {
  const lines = content.split("\n");
  let inCodeBlock = false;
  return lines
    .map((line) => {
      if (line.trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;
      const codeSpans: string[] = [];
      const masked = line.replace(/`[^`]+`/g, (m) => {
        codeSpans.push(m);
        return `\x00CODE${codeSpans.length - 1}\x00`;
      });
      const escaped = masked.replace(/</g, "&lt;");
      return escaped.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeSpans[Number(i)]);
    })
    .join("\n");
}

export function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 250);
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

export type { ContentItem, ContentMeta, TocEntry, SectionMeta };
