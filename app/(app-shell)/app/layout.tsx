import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "LegacyForward.ai App — AI Career Navigator",
    template: "%s | LegacyForward.ai App",
  },
  description:
    "Your personalized AI career navigator. Get a roadmap from where you are to where you want to be.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
