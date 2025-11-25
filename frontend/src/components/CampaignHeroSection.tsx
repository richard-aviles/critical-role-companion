/**
 * Campaign Hero Section Component
 * Displays campaign banner with name, description, and quick action buttons
 */

import Link from 'next/link';

interface CampaignHeroSectionProps {
  campaignName: string;
  campaignSlug: string;
  description?: string;
  characterCount: number;
  episodeCount: number;
}

export function CampaignHeroSection({
  campaignName,
  campaignSlug,
  description,
  characterCount,
  episodeCount,
}: CampaignHeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 dark:from-purple-900 dark:via-purple-950 dark:to-indigo-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Campaign Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in">
          {campaignName}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-lg sm:text-xl text-purple-100 dark:text-purple-200 mb-8 max-w-2xl animate-fade-in delay-100">
            {description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm sm:text-base animate-fade-in delay-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">{characterCount}</span>
            <span className="text-purple-100 dark:text-purple-200">
              {characterCount === 1 ? 'Character' : 'Characters'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">{episodeCount}</span>
            <span className="text-purple-100 dark:text-purple-200">
              {episodeCount === 1 ? 'Episode' : 'Episodes'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 animate-fade-in delay-300">
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-gray-100 active:scale-95 transition-all duration-200 min-h-[44px] flex items-center focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
          >
            View Characters
          </Link>
          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 active:scale-95 transition-all duration-200 min-h-[44px] flex items-center focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
          >
            View Episodes
          </Link>
        </div>
      </div>
    </div>
  );
}
