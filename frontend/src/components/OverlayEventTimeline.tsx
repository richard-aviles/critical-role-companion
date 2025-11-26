/**
 * Overlay Event Timeline Component
 * Minimal event timeline for stream overlays
 * Shows recent events with character references and color coding
 */

import { Event, OverlayCharacter } from '@/lib/api';

interface OverlayEventTimelineProps {
  events: Event[];
  characters?: OverlayCharacter[];
  maxEvents?: number;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  combat: '#DC2626', // Red
  roleplay: '#2563EB', // Blue
  exploration: '#059669', // Green
  social: '#7C3AED', // Purple
  skill_check: '#D97706', // Amber
  rest: '#0891B2', // Cyan
  default: '#6B7280', // Gray
};

export function OverlayEventTimeline({
  events,
  characters = [],
  maxEvents = 10
}: OverlayEventTimelineProps) {
  // Sort events by timestamp (most recent first) and limit
  const sortedEvents = [...events]
    .sort((a, b) => {
      const timeA = a.timestamp_in_episode || 0;
      const timeB = b.timestamp_in_episode || 0;
      return timeB - timeA;
    })
    .slice(0, maxEvents);

  // Helper to format timestamp in seconds to MM:SS
  const formatTimestamp = (seconds: number | null | undefined): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to get event type color
  const getEventColor = (eventType: string | null | undefined): string => {
    if (!eventType) return EVENT_TYPE_COLORS.default;
    return EVENT_TYPE_COLORS[eventType.toLowerCase()] || EVENT_TYPE_COLORS.default;
  };

  // Helper to get character by ID
  const getCharacter = (characterId: string) => {
    return characters.find((c) => c.id === characterId);
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-gray-400 text-sm">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">Recent Events</h3>
        <p className="text-xs text-gray-400 mt-1">Latest {sortedEvents.length} events</p>
      </div>

      {/* Events List */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {sortedEvents.map((event, index) => {
          const eventColor = getEventColor(event.event_type);
          const involvedCharacterIds = event.characters_involved || [];

          return (
            <div
              key={event.id}
              className="px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
            >
              {/* Event Header */}
              <div className="flex items-start gap-3">
                {/* Timestamp & Type Indicator */}
                <div className="flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: eventColor }}
                  ></div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mb-1">
                    {formatTimestamp(event.timestamp_in_episode)}
                  </div>

                  {/* Event Name */}
                  <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                    {event.name}
                  </h4>

                  {/* Event Description */}
                  {event.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event Type Badge */}
                  {event.event_type && (
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white uppercase tracking-wider"
                      style={{ backgroundColor: eventColor }}
                    >
                      {event.event_type}
                    </span>
                  )}

                  {/* Characters Involved */}
                  {involvedCharacterIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {involvedCharacterIds.map((charId) => {
                        const character = getCharacter(charId);
                        if (!character) return null;

                        const borderColor =
                          character.resolved_colors?.colors?.border_colors?.[0] ||
                          character.color_theme_override?.border_colors?.[0] ||
                          '#6B7280';

                        return (
                          <span
                            key={charId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 border"
                            style={{ borderColor, color: '#F3F4F6' }}
                          >
                            {character.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Event Type Legend */}
      <div className="bg-gray-800/80 px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(EVENT_TYPE_COLORS)
            .filter(([type]) => type !== 'default')
            .map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
