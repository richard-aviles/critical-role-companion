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
        <div className="rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error || localError}</p>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="your@email.com"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="••••••••"
          required
          minLength={8}
        />
        {isSignup && (
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        )}
      </div>

      {/* Confirm Password Input (Signup Only) */}
      {isSignup && (
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="••••••••"
            required
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">◌</span>
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
        <p className="text-sm text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            type="button"
            onClick={onToggleMode}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </form>
  );
};
