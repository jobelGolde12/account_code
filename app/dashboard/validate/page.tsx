'use client';

import { useState, useTransition } from 'react';
import { validateCode } from '@/lib/actions';
import { CheckCircle, XCircle, Search } from 'lucide-react';

export default function ValidatePage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    account?: Record<string, unknown>;
    error?: string;
  } | null>(null);
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await validateCode(code);
      setResult(res as typeof result);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Validate Code</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Enter an account code to verify if it exists in the system
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Account Code
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter account code"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Validating...' : 'Validate'}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`rounded-xl p-6 border ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.success ? (
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="flex-1">
              {result.success ? (
                <>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Valid Code
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-700 dark:text-green-300">Code:</span>
                      <span className="text-sm font-mono font-medium text-green-900 dark:text-green-100">
                        {result.account?.code as string}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-700 dark:text-green-300">Account:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {result.account?.accounts as string}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Invalid Code
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {result.error || 'The code you entered was not found in the system.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
