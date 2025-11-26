/**
 * Reusable authentication form component
 * Handles both login and signup
 */

'use client';

import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  isLoading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  isLoading,
  error,
  onSubmit,
  onToggleMode,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignup = mode === 'signup';
  const isFormValid =
    email && password && (isSignup ? password === confirmPassword : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!email.includes('@')) {
      setLocalError('Please enter a valid email');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err: any) {
      // Error is handled by the parent component
      // We just need to clear form on success
      if (!err) {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {(error || localError) && (
        <div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-3 shadow-sm">
          <p className="text-sm text-red-800 dark:text-red-300">{error || localError}</p>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all duration-200"
          placeholder="your@email.com"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all duration-200"
          placeholder="••••••••"
          required
          minLength={8}
        />
        {isSignup && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 characters</p>
        )}
      </div>

      {/* Confirm Password Input (Signup Only) */}
      {isSignup && (
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all duration-200"
            placeholder="••••••••"
            required
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full rounded-md bg-purple-600 py-2 text-white font-medium hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
            {isSignup ? 'Creating account...' : 'Logging in...'}
          </span>
        ) : isSignup ? (
          'Create Account'
        ) : (
          'Log In'
        )}
      </button>

      {/* Toggle Mode Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            type="button"
            onClick={onToggleMode}
            disabled={isLoading}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </form>
  );
};
