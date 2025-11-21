/**
 * Event Timeline Component
 * Displays timeline of events within an episode
 */

'use client';

import { Event } from '@/lib/api';
import { EventCard } from './EventCard';

interface EventTimelineProps {
  events: Event[];
  episodeId: string;
  onAddEvent?: () => void;
  onEditEvent?: (id: string) => void;
  onDeleteEvent?: (id: string) => Promise<void>;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  episodeId,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const formatTimestamp = (seconds?: number): string => {
    if (seconds === undefined || seconds === null) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.timestamp_in_episode ?? 0;
    const timeB = b.timestamp_in_episode ?? 0;
    return timeA - timeB;
  });

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Event Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} in this episode
          </p>
        </div>
        {onAddEvent && (
          <button
            onClick={onAddEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        )}
      </div>

      {/* Timeline */}
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first event.
          </p>
          {onAddEvent && (
            <button
              onClick={onAddEvent}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Event
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className="absolute left-8 -translate-x-1/2 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow" />
                </div>

                {/* Event Card */}
                <div className="ml-16 flex-1">
                  <EventCard
                    event={event}
                    onEdit={onEditEvent ? () => onEditEvent(event.id) : undefined}
                    onDelete={onDeleteEvent ? () => onDeleteEvent(event.id) : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
