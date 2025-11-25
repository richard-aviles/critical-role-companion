/**
 * Campaign Browser Component
 * Displays all public campaigns with search/filter functionality
 */

import { useState, useMemo, useEffect } from 'react';
import { Campaign, getPublicCampaigns } from '@/lib/api';
import { PublicCampaignCard } from './PublicCampaignCard';

export function CampaignBrowser() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter campaigns based on search query
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) {
      return campaigns;
    }

    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(query) ||
        campaign.slug.toLowerCase().includes(query) ||
        (campaign.description && campaign.description.toLowerCase().includes(query))
    );
  }, [campaigns, searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" role="status" aria-live="polite" aria-label="Loading campaigns">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          <span className="sr-only">Loading campaigns, please wait</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Header - Phase 3: Dark Mode */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Campaigns
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse and explore all available campaigns
          </p>
        </div>

        {/* Search Bar - FIXED: Added dark mode */}
        <div className="mb-10 animate-fade-in delay-100">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by campaign name, slug, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent transition-all text-base"
            />
            {searchQuery && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all font-semibold min-h-[44px] focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count - FIXED: Added dark mode */}
        <div className="text-base text-gray-600 dark:text-gray-400 mb-8 animate-fade-in delay-200">
          {campaigns.length === 0 ? (
            <p>No campaigns available yet.</p>
          ) : (
            <p>
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCampaigns.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{campaigns.length}</span> campaigns
            </p>
          )}
        </div>

        {/* Campaigns Grid - FIXED: Added dark mode */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery
                ? 'No campaigns match your search.'
                : 'No campaigns available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="animate-fade-in-stagger"
                style={{
                  animationDelay: `${(index + 3) * 50}ms`
                }}
              >
                <PublicCampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
