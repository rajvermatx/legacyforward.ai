interface SessionCardProps {
  number: number;
  title: string;
  duration: string;
  question: string;
  jobAid: string;
}

export default function SessionCard({
  number,
  title,
  duration,
  question,
  jobAid,
}: SessionCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-light">
      <div className="flex items-start gap-4">
        <span className="text-4xl font-bold text-gold font-mono leading-none">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-navy">{title}</h3>
          <p className="text-xs font-medium text-mid mt-1">{duration}</p>
          <p className="mt-3 text-sm text-gray italic leading-relaxed">
            &ldquo;{question}&rdquo;
          </p>
          <p className="mt-3 text-xs text-teal font-medium">
            Job aid: {jobAid}
          </p>
        </div>
      </div>
    </div>
  );
}
