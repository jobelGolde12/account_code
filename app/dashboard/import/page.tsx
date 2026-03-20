'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';

export default function ImportPage() {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ code: string; accountName: string }[] | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<{ code?: string; account_name?: string; accountName?: string }>(worksheet);

        const accounts = jsonData
          .map((row) => ({
            code: String(row.code || '').trim(),
            accountName: String(row.account_name || row.accountName || '').trim(),
          }))
          .filter((row) => row.code && row.accountName);

        if (accounts.length === 0) {
          setError('No valid data found in the file. Please ensure columns are named "code" and "account_name" or "accountName".');
          setPreview(null);
          return;
        }

        setPreview(accounts);
      } catch {
        setError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
        setPreview(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accounts: preview }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Import failed');
          return;
        }

        setResult({ imported: data.imported, skipped: data.skipped });
        setPreview(null);
        setFile(null);
        router.refresh();
      } catch {
        setError('An unexpected error occurred');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Import Accounts</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload an Excel or CSV file to bulk import account codes
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 transition-colors hover:border-blue-500 dark:hover:border-blue-400">
          <Upload className="w-10 h-10 text-zinc-400 mb-4" />
          <label className="cursor-pointer">
            <span className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Choose file
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400"> or drag and drop</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Excel (.xlsx, .xls) or CSV files only
          </p>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{file.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Import complete! {result.imported} accounts imported, {result.skipped} duplicates skipped.
          </p>
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Preview ({preview.length} accounts)
            </h2>
            <button
              onClick={handleImport}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Importing...' : 'Import All'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400">Account Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {preview.slice(0, 100).map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100">{row.code}</td>
                    <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">{row.accountName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 100 && (
              <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                Showing first 100 of {preview.length} records
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
