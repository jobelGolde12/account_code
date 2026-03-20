'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAccounts, getAccountStats } from '@/lib/actions';
import { Database, CheckCircle, Plus, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Account } from '@/drizzle/schema';
import { AccountTable } from '@/components/AccountTable';
import { AccountForm } from '@/components/AccountForm';

const PAGE_SIZE = 30;

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterColumn, setFilterColumn] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadData();
  }, [debouncedSearch]);

  const loadData = async () => {
    setIsLoading(true);
    const [statsData, accountsData] = await Promise.all([
      getAccountStats(),
      getAccounts(debouncedSearch || undefined),
    ]);
    setStats(statsData);
    setAccounts(accountsData);
    setDisplayedCount(PAGE_SIZE);
    setIsLoading(false);
  };

  const handleRefresh = () => {
    startTransition(() => {
      loadData();
    });
  };

  const displayedAccounts = accounts.slice(0, displayedCount);
  const hasMore = displayedCount < accounts.length;

  const filterOptions = [
    { value: 'all', label: 'All Columns' },
    { value: 'jev', label: 'JEV' },
    { value: 'payee', label: 'Payee' },
    { value: 'code', label: 'Code' },
    { value: 'accounts', label: 'Account Name' },
  ];

  const statCards = [
    {
      label: 'Total Accounts',
      value: stats.total,
      icon: Database,
      color: 'blue',
    },
    {
      label: 'Valid Codes',
      value: stats.total,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your account codes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isPending ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <AccountTable accounts={displayedAccounts} showActions={true} />
            
            {hasMore && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing {displayedCount} of {accounts.length} entries
                </p>
                <button
                  onClick={() => setDisplayedCount((prev) => prev + PAGE_SIZE)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  View More
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {!hasMore && accounts.length > PAGE_SIZE && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing all {accounts.length} entries
                </p>
                <button
                  onClick={() => setDisplayedCount(PAGE_SIZE)}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm"
                >
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAddForm && (
        <AccountForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
