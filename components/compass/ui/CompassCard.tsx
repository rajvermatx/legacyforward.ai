'use client';

interface CompassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function CompassCard({ children, className = '', onClick }: CompassCardProps) {
  const base = 'bg-white rounded-lg border border-light shadow-sm p-6';
  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} hover:shadow-md hover:border-mid transition-all text-left w-full ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}
