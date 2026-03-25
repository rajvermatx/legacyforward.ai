interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  centered?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  light = false,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <h2
        className={`text-3xl md:text-4xl font-bold tracking-heading ${
          light ? 'text-white' : 'text-navy'
        }`}
      >
        {title}
      </h2>
      <div className="mt-3 mx-auto w-16 h-1 bg-gold rounded-full" />
      {subtitle && (
        <p
          className={`mt-4 text-lg max-w-3xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-light' : 'text-gray'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
