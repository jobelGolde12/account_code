'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  Upload, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Database },
  { href: '/dashboard/validate', label: 'Validate Code', icon: CheckCircle },
  { href: '/dashboard/import', label: 'Import', icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        )}
      </button>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
