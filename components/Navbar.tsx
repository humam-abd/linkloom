'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on public share view if not needed, but prompt implies standard layout
  // We'll hide it if explicitly on a pure share page if desired, but sticking to App.tsx logic:
  // App.tsx showed navbar everywhere except "PublicView" was a separate Route.
  // In Next.js layout, Navbar is global. We can conditionally hide it.
  if (pathname.startsWith('/share/')) return null;

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">LinkLoom</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 hidden xs:block">Dashboard</Link>
              <div className="h-4 w-px bg-slate-200 hidden xs:block"></div>
              <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout} title="Log out">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" className="text-sm px-3 py-1.5 sm:px-4 sm:py-2">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;