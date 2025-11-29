/**
 * Public Character Card Component
 * Displays character with color override styling and card layout support
 * Supports both "simple" (text-based) and "enhanced" (background + badges) layouts
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
  // Determine background image URL (character takes precedence)
  const backgroundImageUrl = character.background_image_url || layout?.background_image_url;

  // Debug: Log layout and character color data
  console.log(`[PublicCharacterCard] ${character.name}:`, {
    card_type: layout?.card_type,
    character_background: character.background_image_url,
    layout_background: layout?.background_image_url,
    final_background_url: backgroundImageUrl,
    background_url_constructed: backgroundImageUrl ? `url("${backgroundImageUrl}")` : 'none',
    character_colors: character.color_theme_override?.border_colors,
    layout_colors: layout?.border_colors,
    badge_colors: layout?.badge_colors,
    character_stats: character.stats,
    has_hp: character.stats?.hp !== undefined,
    has_ac: character.stats?.ac !== undefined,
  });

  // Styling hierarchy: character override > campaign layout > default
  // Character-level customization takes precedence
  const borderColors = character.color_theme_override?.border_colors ||
                       layout?.border_colors ||
                       ['#3b82f6'];
  const borderColor = borderColors[0]; // For single color fallback
  const borderGradient = borderColors.length >= 4
    ? `linear-gradient(135deg, ${borderColors[0]}, ${borderColors[1]}, ${borderColors[2]}, ${borderColors[3]})`
    : borderColors.length === 2
    ? `linear-gradient(135deg, ${borderColors[0]}, ${borderColors[1]})`
    : borderColor;

  const textColor = character.color_theme_override?.text_color ||
                    layout?.text_color ||
                    '#1f2937';
  const badgeColor = character.color_theme_override?.border_colors?.[0] ||
                     layout?.badge_colors?.[0] ||
                     '#3b82f6';

  // Debug: Log resolved colors
  console.log(`[PublicCharacterCard] ${character.name} - Resolved colors:`, {
    borderColors,
    borderGradient,
    textColor,
    badgeColor,
  });

  // Determine which layout to use: layout?.card_type or default to "simple"
  const cardType = layout?.card_type || 'simple';

  // ============================================
  // ENHANCED LAYOUT RENDERING
  // ============================================
  if (cardType === 'enhanced') {
    return (
      <Link href={`/campaigns/${campaignSlug}/characters/${character.slug}`}>
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
          style={{
            border: '3px solid',
            borderImage: `${borderGradient} 1`,
            borderRadius: '0.5rem',
          }}
        >
          {/* Background Image Container with Badge Overlay */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: '300px',
              backgroundImage: backgroundImageUrl
                ? `url("${backgroundImageUrl}")`
                : 'linear-gradient(135deg, rgb(229, 231, 235), rgb(209, 213, 219))',
              backgroundSize: 'cover',
              backgroundPosition: `calc(50% + ${layout?.background_image_offset_x || 0}%) calc(50% + ${layout?.background_image_offset_y || 0}%)`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Dark overlay for readability */}
            {backgroundImageUrl && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
              />
            )}

            {/* Character Image - positioned at top-left with configurable width */}
            {character.image_url && (
              <div
                className="absolute left-4 top-4 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform"
                style={{
                  width: layout?.image_aspect_ratio === 'landscape'
                    ? `${(layout?.image_width_percent || 35) * 1.5}%`  // 50% wider for landscape
                    : `${layout?.image_width_percent || 35}%`,
                  aspectRatio: layout?.image_aspect_ratio === 'portrait' ? '2/3' :
                              layout?.image_aspect_ratio === 'landscape' ? '4/3' : '1',
                  border: '4px solid',
                  borderImage: `${borderGradient} 1`,
                  borderRadius: '0.5rem',
                }}
              >
                <Image
                  src={character.image_url}
                  alt={character.name}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: `calc(50% + ${character.image_offset_x || 0}%) calc(50% + ${character.image_offset_y || 0}%)`,
                  }}
                />
              </div>
            )}

            {/* Badge Overlay - positioned badges from layout configuration */}
            {/* Filter out HP and AC since they appear in the fixed info section below */}
            {layout?.badge_layout && layout.badge_layout.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {layout.badge_layout
                  .filter((badge: any) => badge.stat !== 'hp' && badge.stat !== 'ac')
                  .map((badge: any, idx: number) => {
                  // Use character color override for badges if available
                  const badgeColors = character.color_theme_override?.badge_interior_gradient?.colors ||
                                     character.color_theme_override?.border_colors ||
                                     layout?.badge_colors;

                  // Create gradient background for badge interior
                  let badgeBgGradient;
                  if (badgeColors && badgeColors.length >= 2) {
                    badgeBgGradient = `radial-gradient(circle, ${badgeColors[0]}, ${badgeColors[1]})`;
                  } else {
                    badgeBgGradient = badgeColors ? badgeColors[idx % badgeColors.length] : '#3b82f6';
                  }

                  return (
                    <div
                      key={badge.stat}
                      className="absolute"
                      style={{
                        left: `${badge.x}%`,
                        top: `${badge.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Gradient border wrapper */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: borderGradient,
                          padding: '3px',
                        }}
                      >
                        {/* Badge content with gradient background */}
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{
                            background: badgeBgGradient,
                          }}
                        >
                          {badge.stat[0].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content Section */}
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

            {/* Level Badge and HP/AC - Enhanced Layout */}
            <div className="flex items-center gap-2 flex-wrap">
              {character.level && (
                <span
                  className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: badgeColor }}
                >
                  Level {character.level}
                </span>
              )}

              {/* HP Badge with Heart Icon (default to 0 if not set) */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${layout?.hp_color?.interior_gradient?.colors?.[0] || '#FF6B6B'}, ${layout?.hp_color?.interior_gradient?.colors?.[1] || '#CC0000'})`,
                  border: `2px solid ${layout?.hp_color?.border || '#FF0000'}`,
                }}
              >
                <span className="text-base">❤️</span>
                <span>{character.stats?.hp ?? 0}</span>
              </div>

              {/* AC Badge with Shield Icon (default to 0 if not set) */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${layout?.ac_color?.interior_gradient?.colors?.[0] || '#A9A9A9'}, ${layout?.ac_color?.interior_gradient?.colors?.[1] || '#696969'})`,
                  border: `2px solid ${layout?.ac_color?.border || '#808080'}`,
                }}
              >
                <span className="text-base">🛡️</span>
                <span>{character.stats?.ac ?? 0}</span>
              </div>
            </div>

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

  // ============================================
  // SIMPLE LAYOUT RENDERING (Default)
  // ============================================

  return (
    <Link href={`/campaigns/${campaignSlug}/characters/${character.slug}`}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow h-full overflow-hidden cursor-pointer group"
        style={{
          border: '3px solid',
          borderImage: `${borderGradient} 1`,
          borderRadius: '0.5rem',
        }}
      >
        {/* Character Image */}
        <div
          className="relative w-full overflow-hidden bg-gray-200 dark:bg-gray-700"
          style={{
            height: '200px'
          }}
        >
          {character.image_url ? (
            <Image
              src={character.image_url}
              alt={character.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              style={{
                objectPosition: `calc(50% + ${character.image_offset_x || 0}%) calc(50% + ${character.image_offset_y || 0}%)`
              }}
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

          {/* Level Badge and HP/AC - Simple Layout */}
          <div className="flex items-center gap-2 flex-wrap">
            {character.level && (
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: badgeColor }}
              >
                Level {character.level}
              </span>
            )}

            {/* HP - Plain text style for Simple layout (default to 0 if not set) */}
            <span className="px-3 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold border border-red-300 dark:border-red-700">
              HP: {character.stats?.hp ?? 0}
            </span>

            {/* AC - Plain text style for Simple layout (default to 0 if not set) */}
            <span className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold border border-gray-300 dark:border-gray-600">
              AC: {character.stats?.ac ?? 0}
            </span>
          </div>

          {/* Display other stats if configured */}
          {layout?.stats_config && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2">
                {layout.stats_config
                  .filter((stat: any) => stat.visible && stat.key !== 'hp' && stat.key !== 'ac')
                  .slice(0, 6)
                  .map((stat: any) => {
                    const value = character.stats?.[stat.key];
                    return (
                      <div key={stat.key} className="text-center">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          {stat.label}
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {value ?? '-'}
                        </p>
                      </div>
                    );
                  })}
              </div>
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
