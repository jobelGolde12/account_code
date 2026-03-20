import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

export default async function Home() {
  const isAuthenticated = await getAuthSession();

  if (isAuthenticated) {
    redirect('/dashboard');
  }

  redirect('/login');
}
