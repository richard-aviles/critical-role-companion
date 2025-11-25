/**
 * Event Form Component
 * Form for creating/editing events
 */

'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventData, UpdateEventData, Character } from '@/lib/api';

interface EventFormProps {
  mode: 'create' | 'edit';
  episodeId: string;
  initialData?: Event;
  availableCharacters?: Character[];
  onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const EVENT_TYPES = [
  { value: 'combat', label: 'Combat' },
  { value: 'roleplay', label: 'Roleplay' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'travel', label: 'Travel' },
  { value: 'rest', label: 'Rest' },
  { value: 'other', label: 'Other' },
];

// Helper to safely parse characters_involved - handle both string and array
const parseCharactersInvolved = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const EventForm: React.FC<EventFormProps> = ({
  mode,
  episodeId,
  initialData,
  availableCharacters = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    timestamp_in_episode: initialData?.timestamp_in_episode?.toString() || '',
    event_type: initialData?.event_type || '',
    characters_involved: parseCharactersInvolved(initialData?.characters_involved),
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCharacterToggle = (characterId: string) => {
    setFormData((prev) => {
      const currentCharacters = prev.characters_involved || [];
      const isSelected = currentCharacters.includes(characterId);

      return {
        ...prev,
        characters_involved: isSelected
          ? currentCharacters.filter((id) => id !== characterId)
          : [...currentCharacters, characterId],
      };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Event name is required');
      return false;
    }

    if (formData.timestamp_in_episode && parseInt(formData.timestamp_in_episode) < 0) {
      setError('Timestamp must be greater than or equal to 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateEventData | UpdateEventData = {
        name: formData.name,
        description: formData.description || undefined,
        event_type: formData.event_type || undefined,
        characters_involved: formData.characters_involved.length > 0 ? formData.characters_involved : undefined,
      };

      if (formData.timestamp_in_episode) {
        submitData.timestamp_in_episode = parseInt(formData.timestamp_in_episode);
      }

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to save event');
    }
  };

  const formatTimestampInput = (seconds: string): string => {
    // Helper to convert MM:SS format to seconds
    if (seconds.includes(':')) {
      const parts = seconds.split(':');
      if (parts.length === 2) {
        const mins = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        return (mins * 60 + secs).toString();
      }
    }
    return seconds;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Event Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Battle with the Glabrezu"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
          required
        />
      </div>

      {/* Event Type */}
      <div>
        <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Type
        </label>
        <select
          id="event_type"
          name="event_type"
          value={formData.event_type}
          onChange={handleChange}
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
        >
          <option value="">Select event type...</option>
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timestamp */}
      <div>
        <label htmlFor="timestamp_in_episode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Timestamp (seconds)
        </label>
        <input
          id="timestamp_in_episode"
          name="timestamp_in_episode"
          type="number"
          min="0"
          value={formData.timestamp_in_episode}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., 3600 (1 hour)"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Time in seconds from the start of the episode (e.g., 3600 = 1 hour)
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="What happened during this event..."
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600"
        />
      </div>

      {/* Characters Involved */}
      {availableCharacters.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Characters Involved
          </label>
          <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
            {availableCharacters.map((character) => (
              <label
                key={character.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.characters_involved.includes(character.id)}
                  onChange={() => handleCharacterToggle(character.id)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {character.name}
                  </span>
                  {character.class_name && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({character.class_name})
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select all characters involved in this event
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 py-2 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
              Saving...
            </span>
          ) : mode === 'create' ? (
            'Create Event'
          ) : (
            'Update Event'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
