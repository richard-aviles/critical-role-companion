/**
 * Campaign Stats Component
 * Displays campaign statistics and navigation
 */

import Link from 'next/link';

interface CampaignStatsProps {
  campaignSlug: string;
  characterCount: number;
  episodeCount: number;
  description?: string;
}

export function CampaignStats({
  campaignSlug,
  characterCount,
  episodeCount,
  description,
}: CampaignStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        {description && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Campaign</h2>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Characters Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {characterCount}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {characterCount === 1 ? 'Character' : 'Characters'}
              </h3>
              <p className="text-gray-600 mb-4">
                Meet the heroes of this campaign
              </p>
              <Link
                href={`/campaigns/${campaignSlug}/characters`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Episodes Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {episodeCount}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {episodeCount === 1 ? 'Episode' : 'Episodes'}
              </h3>
              <p className="text-gray-600 mb-4">
                Follow the campaign story
              </p>
              <Link
                href={`/campaigns/${campaignSlug}/episodes`}
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Campaign Info Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Campaign Info
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {characterCount > 0 && episodeCount > 0
                  ? `${characterCount} ${characterCount === 1 ? 'hero' : 'heroes'}, ${episodeCount} ${episodeCount === 1 ? 'story' : 'stories'}`
                  : 'In Progress'}
              </h3>
              <p className="text-gray-600 text-sm">
                Explore the complete campaign details
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/campaigns/${campaignSlug}/characters`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    → Browse Characters
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/campaigns/${campaignSlug}/episodes`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    → Read Episode Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm">
                Explore the different sections to learn more about the campaign's characters,
                episodes, and story progression.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
