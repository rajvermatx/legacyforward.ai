import type { Metadata } from "next";
import { getBlogPosts, estimateReadingTime } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import SubscribeCTA from "@/components/SubscribeCTA";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practitioner-level insights on enterprise AI transformation, value capture, delivery methodology, and legacy coexistence.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Blog</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Practitioner-level insights on enterprise AI transformation. Each article
            explores a specific angle from the{" "}
            <a href="/framework" className="text-teal-400 hover:underline">LegacyForward framework</a>.
          </p>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-6">
            {posts.map((post) => (
              <ArticleCard
                key={post.meta.slug}
                title={post.meta.title}
                description={post.meta.description}
                date={post.meta.date ?? ""}
                slug={post.meta.slug}
                readingTime={estimateReadingTime(post.content)}
                relatedPillar={post.meta.relatedPillar}
              />
            ))}
          </div>
        </div>
      </section>

      <SubscribeCTA />
    </>
  );
}
