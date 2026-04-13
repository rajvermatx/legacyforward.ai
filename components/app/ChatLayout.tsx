"use client";

import MobileNav from "./MobileNav";

interface ChatLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  showMobileNav?: boolean;
}

export default function ChatLayout({
  leftPanel,
  rightPanel,
  children,
  showMobileNav = true,
}: ChatLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel (sidebar or progress panel) */}
      {leftPanel && (
        <div className="hidden md:flex flex-col shrink-0">
          {leftPanel}
        </div>
      )}

      {/* Main content — messages + input */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>

      {/* Right panel (context panel, desktop only) */}
      {rightPanel && (
        <div className="hidden lg:flex flex-col shrink-0">
          {rightPanel}
        </div>
      )}

      {showMobileNav && <MobileNav />}
    </div>
  );
}
