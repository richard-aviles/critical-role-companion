/**
 * Episodes List Page
 * Displays all episodes for a campaign in a timeline view
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEpisodes, Episode } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { EpisodeTimeline } from '@/components/EpisodeTimeline';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';

function EpisodesPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignId = params.id;

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getEpisodes(campaignId);

        // Sort episodes by season, then episode number
        const sortedEpisodes = [...data].sort((a, b) => {
          const seasonA = a.season || 0;
          const seasonB = b.season || 0;

          if (seasonA !== seasonB) {
            return seasonA - seasonB;
          }

          const episodeA = a.episode_number || 0;
          const episodeB = b.episode_number || 0;
          return episodeA - episodeB;
        });

        setEpisodes(sortedEpisodes);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          setError('Campaign not found. It may have been deleted.');
        } else if (status === 403) {
          setError('You do not have permission to view episodes for this campaign.');
        } else {
          setError(err.message || 'Failed to load episodes. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [campaignId]);

  const handleSelectEpisode = (episodeId: string) => {
    router.push(`/admin/campaigns/${campaignId}/episodes/${episodeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <AdminHeader title="Episodes" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Episodes</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
              className="px-4 py-2 border border-purple-300 dark:border-purple-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:-translate-y-0.5 transition-all duration-200 font-medium shadow-sm focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Back to Campaign
            </button>
            <Link href={`/admin/campaigns/${campaignId}/episodes/new`}>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2 focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Episode
              </button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-4 shadow-lg border-l-4 border-l-red-500">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Episodes Timeline */}
        {!error && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 p-6 transition-all duration-200 border-l-4 border-l-purple-500">
            <EpisodeTimeline
              episodes={episodes}
              onSelectEpisode={handleSelectEpisode}
            />
          </div>
        )}

        {/* Empty State */}
        {!error && episodes.length === 0 && (
          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 transition-all duration-200 border-l-4 border-l-purple-500">
            <svg
              className="mx-auto h-12 w-12 text-purple-400 dark:text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No episodes yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first episode.
            </p>
            <div className="mt-6">
              <Link href={`/admin/campaigns/${campaignId}/episodes/new`}>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-lg focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50">
                  Add Episode
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EpisodesPage() {
  return (
    <ProtectedRoute>
      <EpisodesPageContent />
    </ProtectedRoute>
  );
}
