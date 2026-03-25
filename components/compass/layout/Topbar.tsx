'use client';
import { useCompassStore } from '@/lib/compass-store';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function Topbar() {
  const user = useCompassStore((s) => s.user);
  const setUser = useCompassStore((s) => s.setUser);

  return (
    <header className="h-14 bg-white border-b border-light flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-dark font-medium hidden sm:inline">{user.name}</span>
            </div>
            <button
              onClick={() => setUser(null)}
              className="text-gray hover:text-coral transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link href="/compass/login" className="inline-flex items-center gap-1.5 text-sm text-mid hover:text-blue font-medium">
            <User size={16} /> Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
