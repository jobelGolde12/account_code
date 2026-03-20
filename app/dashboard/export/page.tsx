import { Download, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';
import { getAccountStats } from '@/lib/actions';

const exportOptions = [
  {
    title: 'PDF',
    description:
      'Download a clean printable report for review, filing, and sharing outside the system.',
    href: '/api/export?format=pdf',
    icon: FileText,
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    button:
      'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  },
  {
    title: 'EXCEL',
    description:
      'Download the full account dataset as an Excel workbook for further analysis and record keeping.',
    href: '/api/export?format=excel',
    icon: FileSpreadsheet,
    accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    button:
      'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  },
];

export default async function ExportPage() {
  const stats = await getAccountStats();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium tracking-[0.2em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              ADMIN EXPORT
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Export Account Records
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Choose how you want to export the current account dataset. Both formats use the
                active non-deleted records from the database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Records
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.total}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Formats
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">2</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;

          return (
            <article
              key={option.title}
              className="group rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex rounded-2xl p-3 ${option.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {option.title}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Export as {option.title}
                </h2>
                <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {option.description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Ready for download
                </p>
                <a
                  href={option.href}
                  download
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${option.button}`}
                >
                  <Download className="h-4 w-4" />
                  Download {option.title}
                </a>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900/50">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Export Plan
        </h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">1. Select Format</p>
            <p className="mt-2">Choose either PDF for printable review or Excel for editable analysis.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">2. Generate From Live Data</p>
            <p className="mt-2">The system exports the current non-deleted account rows directly from Turso.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">3. Download and Review</p>
            <p className="mt-2">Each file is returned immediately with a dated filename for easier record management.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
