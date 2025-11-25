/**
 * Admin Header Component
 * Persistent navigation bar for admin section
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow dark:shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left: Logo/Home */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 hover:opacity-75 transition-opacity focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 rounded-lg p-1"
            >
              <div className="w-8 h-8 bg-purple-600 dark:bg-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CR</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">
                Critical Role Companion
              </span>
            </button>

            {/* Title (if provided) */}
            {title && (
              <div className="hidden md:block border-l border-gray-300 dark:border-gray-700 pl-8">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
              </div>
            )}
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
