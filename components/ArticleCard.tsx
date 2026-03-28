import Link from "next/link";

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  readingTime: number;
  relatedPillar?: string;
}

export default function ArticleCard({ title, description, date, slug, readingTime, relatedPillar }: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <p className="text-slate-400 text-xs font-medium">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; {readingTime} min read
        </p>
        {relatedPillar && (
          <span className="text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5">
            {relatedPillar.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </Link>
  );
}
