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
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        {description && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Campaign</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Characters Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:shadow-primary dark:hover:shadow-elevated transition-all duration-200 animate-fade-in delay-100 hover:-translate-y-1">
            <div className="text-center">
              <div className="text-4xl font-bold text-sapphire dark:text-blue-400 mb-2">
                {characterCount}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {characterCount === 1 ? 'Character' : 'Characters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Meet the heroes of this campaign
              </p>
              <Link
                href={`/campaigns/${campaignSlug}/characters`}
                className="inline-block px-4 py-2 bg-blue-600 dark:bg-sapphire text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 active:scale-95 transition-all duration-200 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 font-semibold"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Episodes Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:shadow-emerald dark:hover:shadow-elevated transition-all duration-200 animate-fade-in delay-200 hover:-translate-y-1">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald dark:text-emerald-400 mb-2">
                {episodeCount}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {episodeCount === 1 ? 'Episode' : 'Episodes'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Follow the campaign story
              </p>
              <Link
                href={`/campaigns/${campaignSlug}/episodes`}
                className="inline-block px-4 py-2 bg-emerald dark:bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all duration-200 focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 font-semibold"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Campaign Info Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:shadow-primary dark:hover:shadow-elevated transition-all duration-200 animate-fade-in delay-300 hover:-translate-y-1">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Campaign Info
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {characterCount > 0 && episodeCount > 0
                  ? `${characterCount} ${characterCount === 1 ? 'hero' : 'heroes'}, ${episodeCount} ${episodeCount === 1 ? 'story' : 'stories'}`
                  : 'In Progress'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Explore the complete campaign details
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Links */}
            <div className="animate-fade-in delay-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/campaigns/${campaignSlug}/characters`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    → Browse Characters
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/campaigns/${campaignSlug}/episodes`}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors font-medium"
                  >
                    → Read Episode Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Section */}
            <div className="animate-fade-in delay-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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
