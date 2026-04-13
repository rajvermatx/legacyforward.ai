import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { WebsiteJsonLd } from "@/components/JsonLd";
import SearchDialog from "@/components/SearchDialog";
import { ContinueReadingBanner } from "@/components/ReadingProgress";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebsiteJsonLd />
      <Nav />
      <ContinueReadingBanner />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <SearchDialog />
    </>
  );
}
