/**
 * Admin Login Page
 * Handles both signup and login for admin users
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, error, login, signup, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push('/admin');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleSubmit = async (email: string, password: string) => {
    clearError();

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // On success, useEffect will redirect to /admin
    } catch (err) {
      // Error is displayed in the form
    }
  };

  const toggleMode = () => {
    clearError();
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mythweaver Studio
          </h1>
          <p className="text-purple-100">
            {mode === 'login'
              ? 'Welcome back, Dungeon Master'
              : 'Create your admin account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          )}

          {/* Form */}
          {!isLoading && (
            <AuthForm
              mode={mode}
              isLoading={isLoading}
              error={error}
              onSubmit={handleSubmit}
              onToggleMode={toggleMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-purple-100">
            This is the admin control center for managing D&D campaigns.
            <br />
            Only for authorized streamers and dungeon masters.
          </p>
        </div>
      </div>
    </main>
  );
}
