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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto shadow-primary"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
        <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-elevated p-8 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
      {/* Hero Section */}
      <CampaignHeroSection
        campaignName={campaign.name}
        campaignSlug={slug}
        description={campaign.description}
        characterCount={characterCount}
        episodeCount={episodeCount}
      />

      {/* Stats Section */}
      <div className="py-12 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-950/50">
        <CampaignStats
          campaignSlug={slug}
          characterCount={characterCount}
          episodeCount={episodeCount}
          description={campaign.description}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-900">
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
