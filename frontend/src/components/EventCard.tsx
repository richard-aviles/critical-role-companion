/**
 * Event Card Component
 * Displays single event in timeline
 */

'use client';

import { Event } from '@/lib/api';

interface EventCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
}) => {
  const formatTimestamp = (seconds?: number): string => {
    if (seconds === undefined || seconds === null) return '--:--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventTypeBadgeColor = (eventType?: string): string => {
    if (!eventType) return 'bg-gray-100 text-gray-700';

    switch (eventType.toLowerCase()) {
      case 'combat':
        return 'bg-red-100 text-red-700';
      case 'roleplay':
        return 'bg-purple-100 text-purple-700';
      case 'discovery':
        return 'bg-yellow-100 text-yellow-700';
      case 'exploration':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const truncateDescription = (text?: string, maxLength: number = 120): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
      {/* Header with Timestamp and Type */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timestamp */}
          <span className="text-sm font-mono font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded">
            {formatTimestamp(event.timestamp_in_episode)}
          </span>

          {/* Event Type Badge */}
          {event.event_type && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${getEventTypeBadgeColor(event.event_type)}`}>
              {event.event_type}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors"
                title="Edit event"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Delete event"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Event Name */}
      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {event.name}
      </h4>

      {/* Description (truncated) */}
      {event.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {truncateDescription(event.description)}
        </p>
      )}

      {/* Characters Involved Count */}
      {event.characters_involved && event.characters_involved.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{event.characters_involved.length} character{event.characters_involved.length !== 1 ? 's' : ''} involved</span>
        </div>
      )}
    </div>
  );
};
