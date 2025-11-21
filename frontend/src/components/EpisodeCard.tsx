/**
 * Episode Card Component
 * Displays episode summary in list/grid format
 */

'use client';

import { Episode } from '@/lib/api';

interface EpisodeCardProps {
  episode: Episode;
  onView?: () => void;
  onEdit?: () => void;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  onView,
  onEdit,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getEpisodeLabel = () => {
    if (episode.season && episode.episode_number) {
      return `S${episode.season}E${episode.episode_number}`;
    }
    if (episode.episode_number) {
      return `Episode ${episode.episode_number}`;
    }
    return 'Episode';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Episode Number and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            {getEpisodeLabel()}
          </span>
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
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {episode.name}
      </h3>

      {/* Episode Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(episode.air_date)}</span>
        </div>

        {episode.runtime && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatRuntime(episode.runtime)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onView && (
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            View
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
