"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/caii", label: "CAII Report", icon: "📊" },
  { href: "/roadmap", label: "Roadmap", icon: "📌" },
  { href: "/coach", label: "AI Coach", icon: "💬" },
  { href: "/wins", label: "Wins", icon: "🏆" },
  { href: "/bridge", label: "Bridge Builder", icon: "🔧" },
  { href: "/book", label: "Career Book", icon: "📖" },
  { href: "/pricing", label: "Pricing", icon: "💎" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex w-60 flex-col h-screen sticky top-0 border-r border-slate-200 bg-white p-4">
      <Link href="/app/dashboard" className="text-lg font-bold text-indigo-600 mb-6">
        LegacyForward.ai
      </Link>

      <nav className="flex flex-col gap-0.5 text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200">
        {session?.user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate">
                {session.user.name || session.user.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[10px] text-slate-400 hover:text-rose-500 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="text-xs text-indigo-600 font-semibold hover:underline">
            Sign in →
          </Link>
        )}
      </div>
    </aside>
  );
}
