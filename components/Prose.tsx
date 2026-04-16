import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

interface ProseProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (children && typeof children === "object" && "props" in children) {
    return getTextContent((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function HeadingWithId({ level, children }: { level: number; children: ReactNode }) {
  const text = getTextContent(children);
  const id = slugify(text);

  // h3 headings that match "Pattern N:" or "Stage N:" or "Gate N:" get a numbered badge
  const patternMatch = text.match(/^(Pattern|Stage|Gate|Phase)\s+(\d+)/i);

  if (level === 3 && patternMatch) {
    const label = patternMatch[1];
    const num = patternMatch[2];
    const rest = text.replace(/^(Pattern|Stage|Gate|Phase)\s+\d+[:\s]*/i, "").replace(/^\(.*?\)\s*/, "");
    return (
      <div id={id} className="not-prose mt-12 mb-4 scroll-mt-20">
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center text-sm font-bold">
            {num}
          </span>
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{label}</p>
            <h3 className="text-xl font-bold text-navy-900 m-0">{rest || text}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (level === 2) {
    return (
      <h2 id={id} className="mt-14 mb-4 pb-3 border-b border-slate-200">
        {children}
      </h2>
    );
  }

  return <h3 id={id}>{children}</h3>;
}

const components = {
  h2: ({ children }: { children?: ReactNode }) => (
    <HeadingWithId level={2}>{children}</HeadingWithId>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <HeadingWithId level={3}>{children}</HeadingWithId>
  ),
  // Blockquotes become teal-accented callout boxes
  blockquote: ({ children }: { children?: ReactNode }) => (
    <div className="not-prose my-6 border-l-4 border-teal-500 bg-slate-50 rounded-r-lg px-6 py-5 text-slate-700 text-base leading-relaxed [&_p]:m-0 [&_strong]:text-navy-900">
      {children}
    </div>
  ),
  // Horizontal rules become spacious section dividers
  hr: () => (
    <div className="not-prose my-14 flex items-center gap-4">
      <div className="flex-1 h-px bg-slate-200" />
      <div className="w-2 h-2 rounded-full bg-teal-500" />
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
  // h4 headings are sub-section labels
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="mt-6 mb-2 text-base font-semibold text-navy-900 uppercase tracking-wide">
      {children}
    </h4>
  ),
  // Tables get a card wrapper
  table: ({ children }: { children?: ReactNode }) => (
    <div className="not-prose my-8 overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-slate-50 text-navy-900 font-semibold text-left">
      {children}
    </thead>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-3 border-b border-slate-200">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-4 py-3 border-b border-slate-100 text-slate-700">{children}</td>
  ),
};

export default function Prose({ content }: ProseProps) {
  return (
    <div className="prose prose-slate prose-lg max-w-none prose-headings:text-navy-900 prose-headings:font-bold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-900 prose-headings:scroll-mt-20 prose-li:marker:text-teal-500">
      <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
