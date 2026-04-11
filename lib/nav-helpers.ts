import type { ContentMeta } from "./types";

export function getPrevNext(
  items: { meta: ContentMeta }[],
  currentSlug: string,
  basePath: string
): { prev: { title: string; href: string } | null; next: { title: string; href: string } | null } {
  const idx = items.findIndex((i) => i.meta.slug === currentSlug);
  return {
    prev: idx > 0 ? { title: items[idx - 1].meta.title, href: `${basePath}/${items[idx - 1].meta.slug}` } : null,
    next: idx < items.length - 1 ? { title: items[idx + 1].meta.title, href: `${basePath}/${items[idx + 1].meta.slug}` } : null,
  };
}
