/**
 * Public Campaign Detail Page
 * Displays campaign overview with character and episode stats
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicCampaign } from '@/lib/api';
import { Campaign } from '@/lib/api';
import { CampaignHeroSection } from '@/components/CampaignHeroSection';
import { CampaignStats } from '@/components/CampaignStats';

function CampaignDetailPageContent() {
  const params = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug;

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicCampaign(slug);
        setCampaign(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCampaign();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const characterCount = campaign.character_count || 0;
  const episodeCount = campaign.episode_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <CampaignHeroSection
        campaignName={campaign.name}
        campaignSlug={slug}
        description={campaign.description}
        characterCount={characterCount}
        episodeCount={episodeCount}
      />

      {/* Stats Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <CampaignStats
          campaignSlug={slug}
          characterCount={characterCount}
          episodeCount={episodeCount}
          description={campaign.description}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CampaignDetailPage() {
  return <CampaignDetailPageContent />;
}
