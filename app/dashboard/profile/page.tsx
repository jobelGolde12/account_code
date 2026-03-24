import { getCurrentUser } from '@/lib/actions';
import { ProfilePageClient } from './ProfilePageClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400">User not found</p>
        </div>
      </div>
    );
  }

  return <ProfilePageClient user={user} />;
}
