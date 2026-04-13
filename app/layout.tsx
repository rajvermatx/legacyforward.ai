import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LegacyForward.ai — Enterprise AI Transformation Framework",
    template: "%s | LegacyForward.ai",
  },
  description:
    "The practitioner's platform for enterprise AI transformation — framework, library, and tools for Signal Capture, Grounded Delivery, and Legacy Coexistence.",
  metadataBase: new URL("https://legacyforward.ai"),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LegacyForward.ai",
    title: "LegacyForward.ai — Enterprise AI Transformation Framework",
    description:
      "A practitioner's framework for capturing real value from enterprise AI without burning down the systems that keep the lights on.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-white text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
