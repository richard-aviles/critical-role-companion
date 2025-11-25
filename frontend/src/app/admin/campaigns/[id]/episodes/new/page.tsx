/**
 * Create Episode Page
 * Form to create a new episode for a campaign
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEpisode, CreateEpisodeData, UpdateEpisodeData, Episode, setAuthToken } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';
import { EpisodeForm } from '@/components/EpisodeForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';

function NewEpisodePageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, campaigns, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const campaignId = params.id;

  // Get campaign admin token on mount
  useEffect(() => {
    // Find the campaign's admin_token from the campaigns list
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setAdminToken(campaign.admin_token);
      setAuthToken(campaign.admin_token);
    }
  }, [campaignId, campaigns]);

  // Redirect to login if not authenticated, only after auth has loaded
  useEffect(() => {
    if (isAuthLoading) {
      return; // Don't do anything while auth is loading
    }

    if (!user) {
      router.push('/admin/login');
      return;
    }

    setIsReady(true);
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (data: CreateEpisodeData | UpdateEpisodeData) => {
    setIsLoading(true);
    setError(null);

    try {
      const episode = await createEpisode(data as CreateEpisodeData, adminToken || undefined);

      // Redirect to episode detail page on success
      router.push(`/admin/campaigns/${campaignId}/episodes/${episode.id}`);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 403) {
        setError('You do not have permission to create episodes for this campaign.');
      } else if (status === 404) {
        setError('Campaign not found. It may have been deleted.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to create episode');
      }
      setIsLoading(false);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push(`/admin/campaigns/${campaignId}/episodes`);
  };

  if (isAuthLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader title="Create Episode" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation back to episodes list */}
        <div className="mb-6">
          <Link
            href={`/admin/campaigns/${campaignId}/episodes`}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Episodes
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Episode</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add a new episode to your campaign
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Episode Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6">
          <EpisodeForm
            mode="create"
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default function NewEpisodePage() {
  return (
    <ProtectedRoute>
      <NewEpisodePageContent />
    </ProtectedRoute>
  );
}
