import Link from "next/link";

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  readingTime: number;
}

export default function ArticleCard({ title, description, date, slug, readingTime }: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block border border-slate-200 rounded-lg p-6 hover:border-teal-500 transition-colors"
    >
      <p className="text-slate-400 text-xs font-medium mb-2">
        {new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        &middot; {readingTime} min read
      </p>
      <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </Link>
  );
}
