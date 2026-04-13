import Providers from "@/components/app/Providers";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="h-screen overflow-hidden bg-slate-50">{children}</div>
    </Providers>
  );
}
