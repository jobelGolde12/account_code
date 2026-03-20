import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await getAuthSession();

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-56 min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </>
  );
}
