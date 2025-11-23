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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading episodes...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href={`/campaigns/${slug}`} className="hover:text-blue-600">
              {campaign.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Episodes</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Episode Guide</h1>
          <p className="mt-2 text-gray-600">
            Follow the complete story of {campaign.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              No episodes published yet.
            </p>
            <Link
              href={`/campaigns/${slug}`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Campaign
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                </h2>
              </div>
            </div>

            <PublicEpisodeTimeline episodes={episodes} campaignSlug={slug} />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
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
