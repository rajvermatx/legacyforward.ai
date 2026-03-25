import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Meridian Compass',
    default: 'Meridian Compass — LegacyForward™',
  },
  description: 'The operational companion tool for the Meridian Method™. Free tools for BAs, QAs, PMs, and product owners working on LLM projects.',
};

export default function CompassLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
