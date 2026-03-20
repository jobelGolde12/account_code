'use client';

import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:block">
              Account Code System
            </span>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-4">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/accounts"
              className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Accounts
            </Link>
            <Link
              href="/dashboard/validate"
              className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Validate Code
            </Link>
            <Link
              href="/dashboard/import"
              className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Import
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
