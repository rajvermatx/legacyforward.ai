import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  type?: 'button' | 'submit';
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gold text-white hover:bg-amber border-gold',
  secondary:
    'bg-transparent text-white border-white hover:bg-white/10',
  ghost:
    'bg-transparent text-navy border-transparent hover:bg-pale',
};

export default function Button({
  children,
  href,
  variant = 'primary',
  type = 'button',
  className = '',
  onClick,
  fullWidth,
}: ButtonProps) {
  const base = `inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-base border-2 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={base}>
      {children}
    </button>
  );
}
