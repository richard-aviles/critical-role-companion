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
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Campaign Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          {campaignName}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
            {description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">{characterCount}</span>
            <span className="text-blue-100">
              {characterCount === 1 ? 'Character' : 'Characters'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-2xl">{episodeCount}</span>
            <span className="text-blue-100">
              {episodeCount === 1 ? 'Episode' : 'Episodes'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            View Characters
          </Link>
          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Episodes
          </Link>
        </div>
      </div>
    </div>
  );
}
