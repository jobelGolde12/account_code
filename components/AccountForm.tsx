'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { addAccount, updateAccount } from '@/lib/actions';
import { Account } from '@/drizzle/schema';
import { Plus, Pencil, FileText, Calendar, Hash, User, AlignLeft, Code, CreditCard, ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';

interface AccountCodeOption {
  code: string;
  name: string;
}

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
  onSuccess?: () => void;
  accountCodeOptions?: AccountCodeOption[];
  payeeOptions?: string[];
}

export function AccountForm({ isOpen, onClose, account, onSuccess, accountCodeOptions = [], payeeOptions = [] }: AccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [customCode, setCustomCode] = useState<string>('');
  const [useCustomCode, setUseCustomCode] = useState<boolean>(false);
  const [payeeSuggestions, setPayeeSuggestions] = useState<string[]>([]);
  const [showPayeeSuggestions, setShowPayeeSuggestions] = useState(false);
  const payeeInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    jev: account?.jev || '',
    barangay: account?.barangay || '',
    date: account?.date || new Date().toISOString().split('T')[0],
    checkRcdNo: account?.checkRcdNo || '',
    payee: account?.payee || '',
    particulars: account?.particulars || '',
    code: account?.code || '',
    accounts: account?.accounts || '',
    debit: account?.debit || '',
    credit: account?.credit || '',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        jev: account.jev || '',
        barangay: account.barangay || '',
        date: account.date || new Date().toISOString().split('T')[0],
        checkRcdNo: account.checkRcdNo || '',
        payee: account.payee || '',
        particulars: account.particulars || '',
        code: account.code || '',
        accounts: account.accounts || '',
        debit: account.debit || '',
        credit: account.credit || '',
      });
      
      if (account.code) {
        const existsInOptions = accountCodeOptions.some(opt => opt.code === account.code);
        if (existsInOptions) {
          setSelectedCode(account.code);
          setUseCustomCode(false);
        } else {
          setUseCustomCode(true);
          setCustomCode(account.code);
          setSelectedCode('');
        }
      }
    }
  }, [account, accountCodeOptions]);

  useEffect(() => {
    if (selectedCode) {
      const selected = accountCodeOptions.find(opt => opt.code === selectedCode);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          code: selected.code,
          accounts: selected.name
        }));
      }
    }
  }, [selectedCode, accountCodeOptions]);

  useEffect(() => {
    if (useCustomCode && customCode) {
      setFormData(prev => ({
        ...prev,
        code: customCode,
        accounts: ''
      }));
    }
  }, [customCode, useCustomCode]);

  const handlePayeeChange = (value: string) => {
    setFormData(prev => ({ ...prev, payee: value }));
    if (value.length > 0 && payeeOptions.length > 0) {
      const filtered = payeeOptions.filter(opt => 
        opt.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setPayeeSuggestions(filtered);
      setShowPayeeSuggestions(filtered.length > 0);
    } else {
      setShowPayeeSuggestions(false);
    }
  };

  const selectPayee = (payee: string) => {
    setFormData(prev => ({ ...prev, payee }));
    setShowPayeeSuggestions(false);
  };

  const handleCodeChange = (code: string) => {
    if (code === '__custom__') {
      setUseCustomCode(true);
      setSelectedCode('');
      setFormData(prev => ({ ...prev, code: '', accounts: '' }));
    } else {
      setUseCustomCode(false);
      setSelectedCode(code);
    }
  };

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

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const dateInputClass = "w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const selectClass = "w-full pl-10 pr-10 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer";
  const customInputClass = "w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono";
  const labelClass = "flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Entry' : 'Add Entry'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Fill in the journal entry voucher details below. All fields marked with * are required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative">
            <label className={labelClass}>
              <FileText className="w-4 h-4" />
              JEV Number *
            </label>
            <FileText className={iconClass} />
            <input
              type="text"
              value={formData.jev}
              onChange={(e) => setFormData({ ...formData, jev: e.target.value })}
              className={inputClass}
              placeholder="2020-01-001"
              required
            />
          </div>
          
          <div className="relative">
            <label className={labelClass}>
              <Calendar className="w-4 h-4" />
              Date *
            </label>
            <Calendar className={iconClass} />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={dateInputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative">
            <label className={labelClass}>
              <Hash className="w-4 h-4" />
              Check/RCD No.
            </label>
            <Hash className={iconClass} />
            <input
              type="text"
              value={formData.checkRcdNo}
              onChange={(e) => setFormData({ ...formData, checkRcdNo: e.target.value })}
              className={inputClass}
              placeholder="740259"
            />
          </div>
          
          <div className="relative">
            <label className={labelClass}>
              <User className="w-4 h-4" />
              Payee *
            </label>
            <User className={iconClass} />
            <input
              type="text"
              ref={payeeInputRef}
              value={formData.payee}
              onChange={(e) => handlePayeeChange(e.target.value)}
              onFocus={() => formData.payee.length > 0 && payeeSuggestions.length > 0 && setShowPayeeSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPayeeSuggestions(false), 200)}
              className={inputClass}
              placeholder="Type to search..."
              required
              autoComplete="off"
            />
            {showPayeeSuggestions && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
                {payeeSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPayee(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-900 dark:text-zinc-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <AlignLeft className="w-4 h-4" />
            Particulars
          </label>
          <textarea
            value={formData.particulars}
            onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
            className={inputClass + " min-h-[80px] resize-y"}
            placeholder="Cash Advance for Salaries & Wages"
            rows={2}
          />
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className={labelClass}>
                <Code className="w-4 h-4" />
                Account Code *
              </label>
              <Code className={iconClass} />
              {accountCodeOptions.length > 0 && !useCustomCode ? (
                <div className="relative">
                  <select
                    value={selectedCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select Account Code</option>
                    {accountCodeOptions.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Code</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={useCustomCode ? customCode : formData.code}
                  onChange={(e) => {
                    if (!useCustomCode) {
                      setFormData({ ...formData, code: e.target.value });
                    } else {
                      setCustomCode(e.target.value);
                    }
                  }}
                  className={customInputClass}
                  placeholder="1-03-03-010"
                  required
                />
              )}
              {useCustomCode && (
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomCode(false);
                    setCustomCode('');
                    setSelectedCode('');
                    setFormData(prev => ({ ...prev, code: '', accounts: '' }));
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Use List
                </button>
              )}
            </div>
            
            <div className="relative">
              <label className={labelClass}>
                <CreditCard className="w-4 h-4" />
                Account Name *
              </label>
              <CreditCard className={iconClass} />
              <input
                type="text"
                value={formData.accounts}
                onChange={(e) => setFormData({ ...formData, accounts: e.target.value })}
                className={inputClass}
                placeholder={useCustomCode ? "Advances for Payroll" : "Auto-filled from code"}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">₱</span>
            </span>
            Amount
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className={labelClass}>
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
                Debit
              </label>
              <input
                type="text"
                value={formData.debit}
                onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
                className={inputClass + " font-mono"}
                placeholder="0.00"
              />
            </div>
            
            <div className="relative">
              <label className={labelClass}>
                <ArrowUpRight className="w-4 h-4 text-red-600" />
                Credit
              </label>
              <input
                type="text"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                className={inputClass + " font-mono"}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : account ? (
              <>
                <Pencil className="w-4 h-4" />
                Update Entry
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Entry
              </>
            )}
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
