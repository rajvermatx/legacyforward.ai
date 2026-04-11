"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/coach", label: "Coach", icon: "💬" },
  { href: "/wins", label: "Wins", icon: "🏆" },
  { href: "/book", label: "Book", icon: "📖" },
  { href: "/caii", label: "CAII", icon: "📊" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50 safe-area-pb">
      {MOBILE_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center py-3 ${
              isActive ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <div className="text-lg">{item.icon}</div>
            <div className="text-[10px]">{item.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
