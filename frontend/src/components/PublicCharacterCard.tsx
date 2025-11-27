/**
 * Public Character Card Component
 * Displays character with color override styling and card layout support
 * Supports both "simple" (text-based) and "enhanced" (visual badges) layouts
 */

import Link from 'next/link';
import Image from 'next/image';
import { Character } from '@/lib/api';

interface PublicCharacterCardProps {
  character: Character;
  campaignSlug: string;
  layout?: any;
}

export function PublicCharacterCard({ character, campaignSlug, layout }: PublicCharacterCardProps) {
  // Styling hierarchy: character override > campaign layout > default
  // Character-level customization takes precedence
  const borderColor = character.color_theme_override?.border_colors?.[0] ||
                      layout?.border_colors?.[0] ||
                      '#3b82f6';
  const textColor = character.color_theme_override?.text_color ||
                    layout?.text_color ||
                    '#1f2937';
  const badgeColor = character.color_theme_override?.border_colors?.[0] ||
                     layout?.badge_colors?.[0] ||
                     '#3b82f6';

  // Determine which layout to use: layout?.card_type or default to "simple"
  const cardType = layout?.card_type || 'simple';

  return (
    <Link href={`/campaigns/${campaignSlug}/characters/${character.slug}`}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow h-full overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-700"
        style={{
          borderLeft: `4px solid ${borderColor}`,
        }}
      >
        {/* Character Image */}
        <div
          className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-700"
          style={{
            height: cardType === 'enhanced' ? '280px' : '200px'
          }}
        >
          {character.image_url ? (
            <Image
              src={character.image_url}
              alt={character.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <svg
                className="w-16 h-16 text-gray-500 dark:text-gray-400"
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Class:</span> {character.class_name}
              </p>
            )}
            {character.race && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Race:</span> {character.race}
              </p>
            )}
          </div>

          {/* Level Badge */}
          {character.level && (
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: badgeColor }}
              >
                Level {character.level}
              </span>
            </div>
          )}

          {/* Enhanced Layout: Display Stats if configured */}
          {cardType === 'enhanced' && layout?.stats_config && character.stats && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2">
                {layout.stats_config
                  .filter((stat: any) => stat.visible)
                  .slice(0, 6)
                  .map((stat: any) => {
                    const value = character.stats[stat.key];
                    return (
                      <div key={stat.key} className="text-center">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          {stat.label}
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: textColor }}
                        >
                          {value || '-'}
                        </p>
                      </div>
                    );
                  })}
              </div>

              {/* Display HP and AC separately if available */}
              {(character.stats?.hp || character.stats?.ac) && (
                <div className="flex gap-3 mt-3">
                  {character.stats?.hp && (
                    <div
                      className="flex-1 px-3 py-2 rounded text-center"
                      style={{
                        backgroundColor: layout.hp_color?.border || badgeColor,
                        opacity: 0.1
                      }}
                    >
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">HP</p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: textColor }}
                      >
                        {character.stats.hp}
                      </p>
                    </div>
                  )}
                  {character.stats?.ac && (
                    <div
                      className="flex-1 px-3 py-2 rounded text-center"
                      style={{
                        backgroundColor: layout.ac_color?.border || badgeColor,
                        opacity: 0.1
                      }}
                    >
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">AC</p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: textColor }}
                      >
                        {character.stats.ac}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Player Name */}
          {character.player_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              Player: {character.player_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
