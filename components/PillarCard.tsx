import Link from "next/link";

interface PillarCardProps {
  number: number;
  title: string;
  description: string;
  slug: string;
}

export default function PillarCard({ number, title, description, slug }: PillarCardProps) {
  return (
    <Link
      href={`/framework/${slug}`}
      className="group block bg-white border border-slate-200 rounded-lg p-8 hover:border-teal-500 hover:shadow-md transition-all"
    >
      <p className="text-teal-500 text-sm font-semibold mb-2">Pillar {number}</p>
      <h3 className="text-xl font-bold text-navy-900 mb-3 group-hover:text-teal-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </Link>
  );
}
