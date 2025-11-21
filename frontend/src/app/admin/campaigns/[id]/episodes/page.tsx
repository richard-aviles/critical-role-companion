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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Episodes" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Episodes</h1>
            <p className="mt-1 text-sm text-gray-600">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href={`/admin/campaigns/${campaignId}/episodes/new`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Episode
            </button>
          </Link>
        </div>

        {/* Navigation back to campaign */}
        <div className="mb-6">
          <Link
            href={`/admin/campaigns/${campaignId}`}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaign
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Episodes Timeline */}
        {!error && (
          <div className="bg-white rounded-lg shadow p-6">
            <EpisodeTimeline
              episodes={episodes}
              onSelectEpisode={handleSelectEpisode}
            />
          </div>
        )}

        {/* Empty State */}
        {!error && episodes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No episodes yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first episode.
            </p>
            <div className="mt-6">
              <Link href={`/admin/campaigns/${campaignId}/episodes/new`}>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
