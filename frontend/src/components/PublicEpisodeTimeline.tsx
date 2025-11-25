/**
 * Public Episode Timeline Component
 * Displays episodes in a vertical timeline layout
 */

import Link from 'next/link';
import { Episode } from '@/lib/api';

interface PublicEpisodeTimelineProps {
  episodes: Episode[];
  campaignSlug: string;
}

export function PublicEpisodeTimeline({ episodes, campaignSlug }: PublicEpisodeTimelineProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 dark:text-gray-400">No episodes available yet.</p>
      </div>
    );
  }

  // Group episodes by season
  const groupedBySeason = episodes.reduce(
    (acc, ep) => {
      const season = ep.season || 0;
      if (!acc[season]) acc[season] = [];
      acc[season].push(ep);
      return acc;
    },
    {} as Record<number, Episode[]>
  );

  // Sort seasons in descending order
  const seasons = Object.keys(groupedBySeason)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-12">
      {seasons.map((season) => (
        <div key={season}>
          {/* Season Header */}
          {season > 0 && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="h-1 w-12 bg-purple-600 dark:bg-purple-500 rounded"></span>
              Season {season}
            </h2>
          )}

          {/* Episodes */}
          <div className="space-y-4">
            {groupedBySeason[season]!.map((episode, index) => (
              <Link
                key={episode.id}
                href={`/campaigns/${campaignSlug}/episodes/${episode.slug}`}
              >
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg hover:shadow-lg dark:hover:shadow-2xl transition-shadow p-6 cursor-pointer group dark:border dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    {/* Episode Number */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {episode.episode_number || index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                        {episode.name}
                      </h3>

                      {episode.description && (
                        <p className="mt-2 text-gray-800 dark:text-gray-400 text-sm line-clamp-2">
                          {episode.description}
                        </p>
                      )}

                      {/* Episode Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-800 dark:text-gray-400">
                        {episode.air_date && (
                          <span>
                            📅{' '}
                            {new Date(episode.air_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                        {episode.runtime && (
                          <span>⏱️ {episode.runtime} min</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
