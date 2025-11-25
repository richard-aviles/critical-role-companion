/**
 * Public Campaign Card Component
 * Displays campaign summary with character and episode counts
 */

import Link from 'next/link';
import { Campaign } from '@/lib/api';

interface PublicCampaignCardProps {
  campaign: Campaign;
}

export function PublicCampaignCard({ campaign }: PublicCampaignCardProps) {
  const characterCount = campaign.character_count || 0;
  const episodeCount = campaign.episode_count || 0;

  return (
    <Link href={`/campaigns/${campaign.slug}`}>
      <div className="animate-fade-in-stagger bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 h-full p-8 border-l-4 border-blue-600 dark:border-blue-500 cursor-pointer hover:border-purple-600 dark:hover:border-purple-400 hover:-translate-y-1">
        {/* Campaign Name - Phase 3: Dark Mode - FIXED: Using direct hex color for purple (#6B46C1) */}
        <h3 className="text-2xl font-bold mb-3 line-clamp-2" style={{ color: '#6B46C1' }}>
          {campaign.name}
        </h3>

        {/* Campaign Description */}
        {campaign.description && (
          <p className="text-gray-600 dark:text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
            {campaign.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* Characters */}
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 group-hover:text-purple-600 transition-colors">
              {characterCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              {characterCount === 1 ? 'Character' : 'Characters'}
            </p>
          </div>

          {/* Episodes */}
          <div className="text-center group">
            <div className="text-3xl font-bold text-green-600 dark:text-green-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {episodeCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              {episodeCount === 1 ? 'Episode' : 'Episodes'}
            </p>
          </div>
        </div>

        {/* CTA - Phase 3: Dark Mode */}
        <div className="mt-6 text-center">
          <span className="text-base text-blue-600 dark:text-blue-400 font-semibold hover:text-purple-600 dark:hover:text-purple-300 transition-colors inline-block">
            Explore Campaign →
          </span>
        </div>
      </div>
    </Link>
  );
}
