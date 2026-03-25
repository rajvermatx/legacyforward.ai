import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'LegacyForward — Calibration-First LLM Delivery',
    template: '%s | LegacyForward',
  },
  description:
    'The Meridian Method™ — a calibration-first delivery methodology for LLM integration in legacy enterprise environments. LLM Allied Skills training for BAs, QAs, PMs, POs, and Data Stewards.',
  openGraph: {
    siteName: 'LegacyForward',
    type: 'website',
    url: 'https://legacyforward.ai',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <Nav />
        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
