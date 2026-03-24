'use client';

import { useState, useTransition } from 'react';
import { User as UserIcon, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { updateUser } from '@/lib/actions';
import { User } from '@/drizzle/schema';

interface ProfilePageClientProps {
  user: User;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: user.username,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (formData.currentPassword !== user.password) {
        setError('Current password is incorrect');
        return;
      }
      if (formData.newPassword.length < 4) {
        setError('New password must be at least 4 characters');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    if (formData.username === user.username && !formData.newPassword) {
      setError('No changes detected');
      return;
    }

    startTransition(async () => {
      const result = await updateUser(user.id, {
        username: formData.username !== user.username ? formData.username : undefined,
        password: formData.newPassword || undefined,
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setError('Failed to update profile');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Profile Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account settings and security preferences
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-blue-100 text-sm">Administrator</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter username"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    Member Since
                  </label>
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Leave password fields empty if you don&apos;t want to change your password.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                      placeholder="Enter current password"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                        placeholder="Enter new password"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                        placeholder="Confirm new password"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <strong>Security Note:</strong> Make sure to use a strong password that you don&apos;t use elsewhere. 
          Your password is stored securely and never shared with anyone.
        </p>
      </div>
    </div>
  );
}
