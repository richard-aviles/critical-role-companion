/**
 * Episode Timeline Component
 * Displays vertical timeline of episodes
 */

'use client';

import { Episode } from '@/lib/api';

interface EpisodeTimelineProps {
  episodes: Episode[];
  selectedId?: string;
  onSelectEpisode?: (id: string) => void;
}

export const EpisodeTimeline: React.FC<EpisodeTimelineProps> = ({
  episodes,
  selectedId,
  onSelectEpisode,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEpisodeLabel = (episode: Episode) => {
    if (episode.season && episode.episode_number) {
      return `S${episode.season}E${episode.episode_number}`;
    }
    if (episode.episode_number) {
      return `E${episode.episode_number}`;
    }
    return '';
  };

  // Sort episodes by season and episode number
  const sortedEpisodes = [...episodes].sort((a, b) => {
    const seasonA = a.season || 0;
    const seasonB = b.season || 0;
    if (seasonA !== seasonB) {
      return seasonA - seasonB;
    }
    const episodeA = a.episode_number || 0;
    const episodeB = b.episode_number || 0;
    return episodeA - episodeB;
  });

  if (sortedEpisodes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No episodes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first episode.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Episodes */}
      <div className="space-y-6">
        {sortedEpisodes.map((episode, index) => {
          const isSelected = episode.id === selectedId;
          const episodeLabel = getEpisodeLabel(episode);

          return (
            <div
              key={episode.id}
              className="relative flex items-start group"
            >
              {/* Timeline Dot */}
              <div className="absolute left-8 -translate-x-1/2 flex items-center justify-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : episode.is_published
                      ? 'bg-white border-green-500'
                      : 'bg-white border-gray-400'
                  }`}
                />
              </div>

              {/* Episode Card */}
              <div className="ml-16 flex-1">
                <div
                  onClick={() => onSelectEpisode?.(episode.id)}
                  className={`bg-white border rounded-lg p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Header with Episode Number and Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {episodeLabel && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {episodeLabel}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        episode.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {episode.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Episode Name */}
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {episode.name}
                  </h3>

                  {/* Air Date */}
                  {episode.air_date && (
                    <p className="text-sm text-gray-600">
                      {formatDate(episode.air_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
