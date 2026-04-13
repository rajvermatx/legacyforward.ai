"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
