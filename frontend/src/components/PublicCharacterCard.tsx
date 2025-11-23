/**
 * Public Character Card Component
 * Displays character with color override styling for public pages
 */

import Link from 'next/link';
import Image from 'next/image';
import { Character } from '@/lib/api';

interface PublicCharacterCardProps {
  character: Character;
  campaignSlug: string;
}

export function PublicCharacterCard({ character, campaignSlug }: PublicCharacterCardProps) {
  // Get border color from color_theme_override or use default
  const borderColor = character.color_theme_override?.border_colors?.[0] || '#3b82f6';
  const textColor = character.color_theme_override?.text_color || '#1f2937';

  return (
    <Link href={`/campaigns/${campaignSlug}/characters/${character.slug}`}>
      <div
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow h-full overflow-hidden cursor-pointer group"
        style={{
          borderLeft: `4px solid ${borderColor}`,
        }}
      >
        {/* Character Image */}
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          {character.image_url ? (
            <Image
              src={character.image_url}
              alt={character.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <svg
                className="w-16 h-16 text-gray-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="p-4">
          {/* Name */}
          <h3
            className="text-lg font-bold mb-2 line-clamp-2"
            style={{ color: textColor }}
          >
            {character.name}
          </h3>

          {/* Class and Race */}
          <div className="space-y-1 mb-3">
            {character.class_name && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Class:</span> {character.class_name}
              </p>
            )}
            {character.race && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Race:</span> {character.race}
              </p>
            )}
          </div>

          {/* Level Badge */}
          {character.level && (
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: borderColor }}
              >
                Level {character.level}
              </span>
            </div>
          )}

          {/* Player Name */}
          {character.player_name && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
              Player: {character.player_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
