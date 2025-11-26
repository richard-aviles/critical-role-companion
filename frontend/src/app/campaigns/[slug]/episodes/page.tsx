/**
 * Public Episode Guide Page
 * Displays all published episodes in timeline format
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicCampaign, getPublicEpisodes } from '@/lib/api';
import { PublicEpisodeTimeline } from '@/components/PublicEpisodeTimeline';

function EpisodeGuidePageContent() {
  const params = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [campaignData, episodesData] = await Promise.all([
          getPublicCampaign(slug),
          getPublicEpisodes(slug),
        ]);

        setCampaign(campaignData);
        setEpisodes(episodesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load episodes');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-700 dark:border-emerald-500 border-t-transparent rounded-full mx-auto shadow-emerald"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading episodes...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
        <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-elevated p-8 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-emerald-200 dark:border-emerald-900/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${slug}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium">
              {campaign.name}
            </Link>
            <span>/</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Episodes</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">Episode Guide</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300 font-medium">
            Follow the complete story of {campaign.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {episodes.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800">
            <svg className="mx-auto h-16 w-16 text-emerald-400 dark:text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 font-medium">
              No episodes published yet.
            </p>
            <Link
              href={`/campaigns/${slug}`}
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5"
            >
              Back to Campaign
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 rounded-full"></span>
                  {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                </h2>
              </div>
            </div>

            <PublicEpisodeTimeline episodes={episodes} campaignSlug={slug} />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-emerald-800/50 dark:border-emerald-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function EpisodeGuidePage() {
  return <EpisodeGuidePageContent />;
}
