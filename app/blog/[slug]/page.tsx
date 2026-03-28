import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPosts, getBlogBySlug, estimateReadingTime, extractHeadings, stripLeadingH1 } from "@/lib/content";
import Prose from "@/components/Prose";
import TableOfContents from "@/components/TableOfContents";
import SubscribeCTA from "@/components/SubscribeCTA";
import { ArticleJsonLd } from "@/components/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const readingTime = estimateReadingTime(post.content);
  const headings = extractHeadings(post.content);

  return (
    <>
      <ArticleJsonLd
        title={post.meta.title}
        description={post.meta.description}
        url={`https://legacyforward.ai/blog/${slug}`}
        datePublished={post.meta.date}
      />
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-slate-300 text-sm font-medium mb-4">
            {post.meta.date &&
              new Date(post.meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            <span className="text-slate-400 ml-2">&middot; {readingTime} min read</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {post.meta.title}
          </h1>
          <p className="text-slate-300 leading-relaxed">{post.meta.description}</p>
        </div>
      </section>

      <article className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
            <TableOfContents headings={headings} />
            <div className="max-w-3xl">
              <Prose content={stripLeadingH1(post.content)} />
            </div>
          </div>
        </div>
      </article>

      {/* Related pillar link */}
      {post.meta.relatedPillar && (
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-6 py-10 text-center">
            <p className="text-slate-500 text-sm mb-1">This article is part of the LegacyForward framework.</p>
            <Link
              href={`/framework/${post.meta.relatedPillar}`}
              className="text-teal-600 font-semibold hover:underline"
            >
              Read the full pillar: {post.meta.relatedPillar.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} &rarr;
            </Link>
          </div>
        </section>
      )}

      <SubscribeCTA
        headline="Liked this? There's more."
        description="Subscribe for new articles on enterprise AI transformation — no hype, no vendor marketing, just what works."
      />
    </>
  );
}
