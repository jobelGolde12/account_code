'use client';

import { useState, useTransition } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { deleteAccount } from '@/lib/actions';
import { Account } from '@/drizzle/schema';
import { AccountForm } from './AccountForm';

interface AccountTableProps {
  accounts: Account[];
  showActions?: boolean;
  onSuccess?: () => void;
}

export function AccountTable({ accounts, showActions = true, onSuccess }: AccountTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [viewAccount, setViewAccount] = useState<Account | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteAccount(id);
      setShowDeleteConfirm(null);
      onSuccess?.();
    });
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        No entries found. Add your first entry to get started.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">JEV</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Payee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Account</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Debit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Credit</th>
              {showActions && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {accounts.map((account) => (
              <tr
                key={account.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                  {account.jev || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-xs">
                  {account.date || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-xs max-w-[150px] truncate">
                  {account.payee || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-medium">
                  {account.code || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-xs max-w-[200px] truncate">
                  {account.accounts || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right font-mono text-xs">
                  {account.debit || '-'}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 text-right font-mono text-xs">
                  {account.credit || '-'}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setViewAccount(account)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditAccount(account)}
                        className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(account.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewAccount(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Entry Details
              </h3>
              <button
                onClick={() => setViewAccount(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">JEV</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 font-mono">{viewAccount.jev || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Date</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{viewAccount.date || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Check/RCD No.</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 font-mono">{viewAccount.checkRcdNo || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Payee</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{viewAccount.payee || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Particulars</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{viewAccount.particulars || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Code</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 font-mono font-medium">{viewAccount.code || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Account</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{viewAccount.accounts || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Debit</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 font-mono">{viewAccount.debit || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Credit</label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 font-mono">{viewAccount.credit || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Delete Entry
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editAccount && (
        <AccountForm
          isOpen={true}
          onClose={() => setEditAccount(null)}
          account={editAccount}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

export default AccountTable;
