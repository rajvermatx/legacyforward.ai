interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
}

export function ArticleJsonLd({ title, description, url, datePublished }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: "LegacyForward.ai",
      url: "https://legacyforward.ai",
    },
    ...(datePublished && { datePublished }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LegacyForward.ai",
    url: "https://legacyforward.ai",
    description:
      "A practitioner's framework for enterprise AI transformation — Signal Capture, Grounded Delivery, and Legacy Coexistence.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
