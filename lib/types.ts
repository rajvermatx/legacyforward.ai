export interface ContentMeta {
  title: string;
  slug: string;
  description: string;
  // Library (careeralign) fields
  section?: string;
  order?: number;
  notebook?: string;
  badges?: string[];
  tags?: string[];
  part?: string;
  // Framework / blog (legacyforward) fields
  date?: string;
  pillar?: number;
  subtitle?: string;
  relatedPillar?: string;
}

export interface ContentItem {
  meta: ContentMeta;
  content: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export interface SectionMeta {
  title: string;
  description: string;
  icon?: string;
  stats?: { value: string; label: string }[];
}
