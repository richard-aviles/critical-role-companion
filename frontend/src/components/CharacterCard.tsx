/**
 * Character Card Component
 * Displays character information in a grid card format
 */

'use client';

import { Character } from '@/lib/api';
import Link from 'next/link';

interface CharacterCardProps {
  character: Character;
  onEdit?: () => void;
  onView?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onView,
}) => {
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg overflow-hidden hover:shadow-lg dark:hover:shadow-primary transition-all duration-200 hover:-translate-y-1">
      {/* Character Image */}
      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <img
          src={character.image_url || placeholderImage}
          alt={character.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
      </div>

      {/* Character Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {character.name}
        </h3>

        <div className="space-y-1 mb-4">
          {character.class_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Class:</span>
              <span className="text-gray-900 dark:text-gray-300">{character.class_name}</span>
            </div>
          )}

          {character.race && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Race:</span>
              <span className="text-gray-900 dark:text-gray-300">{character.race}</span>
            </div>
          )}

          {character.player_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Player:</span>
              <span className="text-gray-900 dark:text-gray-300">{character.player_name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-sapphire dark:bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 active:scale-95 transition-all duration-200 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Character Card Skeleton (loading state)
 */
export const CharacterCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-64 bg-gray-300" />
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-3 w-3/4" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};
