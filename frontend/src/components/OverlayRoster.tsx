/**
 * Overlay Roster Component
 * Compact character roster display for stream overlays
 * Shows all active characters with status indicators
 */

import Image from 'next/image';
import { OverlayCharacter } from '@/lib/api';

interface OverlayRosterProps {
  characters: OverlayCharacter[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  maxCharacters?: number;
}

export function OverlayRoster({
  characters,
  layout = 'grid',
  maxCharacters = 12
}: OverlayRosterProps) {
  // Sort by active status first, then by name
  const sortedCharacters = [...characters]
    .sort((a, b) => {
      if (a.is_active === b.is_active) {
        return a.name.localeCompare(b.name);
      }
      return a.is_active ? -1 : 1;
    })
    .slice(0, maxCharacters);

  if (sortedCharacters.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-gray-400 text-sm">No characters in this campaign</p>
      </div>
    );
  }

  // Horizontal layout - single row, scrollable
  if (layout === 'horizontal') {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pb-2">
          {sortedCharacters.map((character) => (
            <CharacterMiniCard key={character.id} character={character} />
          ))}
        </div>
      </div>
    );
  }

  // Vertical layout - single column
  if (layout === 'vertical') {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg overflow-hidden max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-700 sticky top-0">
          <h3 className="text-lg font-bold text-white">Roster</h3>
          <p className="text-xs text-gray-400 mt-1">{sortedCharacters.length} characters</p>
        </div>
        <div className="space-y-2 p-3">
          {sortedCharacters.map((character) => (
            <CharacterListItem key={character.id} character={character} />
          ))}
        </div>
      </div>
    );
  }

  // Grid layout - responsive grid
  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="bg-gray-800/80 px-4 py-3 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">Character Roster</h3>
        <p className="text-xs text-gray-400 mt-1">{sortedCharacters.length} characters</p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {sortedCharacters.map((character) => (
          <CharacterMiniCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}

// Mini card for grid/horizontal layouts
function CharacterMiniCard({ character }: { character: OverlayCharacter }) {
  const colors = character.resolved_colors?.colors || character.color_theme_override;
  const borderColor = colors?.border_colors?.[0] || '#6B46C1';

  return (
    <div
      className="bg-gray-800/80 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0"
      style={{ borderColor }}
    >
      {/* Character Image */}
      <div className="relative w-full h-20 bg-gray-700">
        {character.image_url ? (
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        {/* Active indicator */}
        {character.is_active && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Level badge */}
        {character.level && (
          <div
            className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-bold text-white"
            style={{ backgroundColor: borderColor }}
          >
            {character.level}
          </div>
        )}
      </div>

      {/* Character Name */}
      <div className="p-2">
        <h4 className="text-xs font-semibold text-white truncate" title={character.name}>
          {character.name}
        </h4>
        {character.class_name && (
          <p className="text-xs text-gray-400 truncate" title={character.class_name}>
            {character.class_name}
          </p>
        )}
      </div>
    </div>
  );
}

// List item for vertical layout
function CharacterListItem({ character }: { character: OverlayCharacter }) {
  const colors = character.resolved_colors?.colors || character.color_theme_override;
  const borderColor = colors?.border_colors?.[0] || '#6B46C1';
  const textColor = colors?.text_color || '#F3F4F6';

  return (
    <div
      className="bg-gray-800/80 rounded-lg p-3 flex items-center gap-3 border-l-4 hover:bg-gray-800 transition-colors"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Character Image */}
      {character.image_url && (
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Character Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate" style={{ color: textColor }}>
          {character.name}
        </h4>
        <p className="text-xs text-gray-400 truncate">
          {character.class_name && character.race
            ? `${character.class_name} - ${character.race}`
            : character.class_name || character.race || 'Adventurer'}
        </p>
      </div>

      {/* Level & Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {character.level && (
          <span
            className="px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: borderColor }}
          >
            Lv {character.level}
          </span>
        )}
        {character.is_active && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
