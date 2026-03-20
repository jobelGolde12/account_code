import { getAccounts } from '@/lib/actions';
import { AccountTable } from '@/components/AccountTable';
import { AddAccountButton } from '@/components/AccountForm';
import { Search } from 'lucide-react';

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || '';
  const accounts = await getAccounts(search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Accounts</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your account codes and names
          </p>
        </div>
        <AddAccountButton />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <form method="GET" action="/dashboard/accounts" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search by code or account name..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>

        <div className="p-4">
          <AccountTable accounts={accounts} />
        </div>
      </div>
    </div>
  );
}
