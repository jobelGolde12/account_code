'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { addAccount, updateAccount } from '@/lib/actions';
import { Account } from '@/drizzle/schema';
import { Plus, Pencil } from 'lucide-react';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
  onSuccess?: () => void;
}

export function AccountForm({ isOpen, onClose, account, onSuccess }: AccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jev: account?.jev || '',
    barangay: account?.barangay || '',
    date: account?.date || '',
    checkRcdNo: account?.checkRcdNo || '',
    payee: account?.payee || '',
    particulars: account?.particulars || '',
    code: account?.code || '',
    accounts: account?.accounts || '',
    debit: account?.debit || '',
    credit: account?.credit || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (account) {
        const result = await updateAccount(account.id, formData);
        if (result.success) {
          onClose();
          onSuccess?.();
        } else {
          setError('Failed to update account');
        }
      } else {
        const result = await addAccount(formData);
        if (result.success) {
          onClose();
          onSuccess?.();
        } else {
          setError('Failed to add account');
        }
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Entry' : 'Add Entry'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              JEV
            </label>
            <input
              type="text"
              value={formData.jev}
              onChange={(e) => setFormData({ ...formData, jev: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="2020-01-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Barangay
            </label>
            <input
              type="text"
              value={formData.barangay}
              onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="BEGUIN"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="1/21/2020"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Check/RCD No.
            </label>
            <input
              type="text"
              value={formData.checkRcdNo}
              onChange={(e) => setFormData({ ...formData, checkRcdNo: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="740259"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Payee
          </label>
          <input
            type="text"
            value={formData.payee}
            onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="DAISY JEAN G. GOSGOLAN"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Particulars
          </label>
          <input
            type="text"
            value={formData.particulars}
            onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="Cash Advance for Salaries & Wages"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="1-03-03-010"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Account
          </label>
          <input
            type="text"
            value={formData.accounts}
            onChange={(e) => setFormData({ ...formData, accounts: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="Advances for Payroll"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Debit
            </label>
            <input
              type="text"
              value={formData.debit}
              onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Credit
            </label>
            <input
              type="text"
              value={formData.credit}
              onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="0.00"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : account ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddAccountButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Entry
      </button>
      <AccountForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
