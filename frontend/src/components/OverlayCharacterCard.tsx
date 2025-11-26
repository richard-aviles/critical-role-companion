/**
 * Overlay Character Card Component
 * Minimal, stream-friendly character display with resolved colors
 * Designed for OBS/Streamlabs overlays
 */

import Image from 'next/image';
import { OverlayCharacter } from '@/lib/api';

interface OverlayCharacterCardProps {
  character: OverlayCharacter;
  variant?: 'compact' | 'full';
}

export function OverlayCharacterCard({ character, variant = 'full' }: OverlayCharacterCardProps) {
  // Get resolved colors or use defaults
  const colors = character.resolved_colors?.colors || character.color_theme_override;
  const borderColors = colors?.border_colors || ['#6B46C1', '#0369A1'];
  const textColor = colors?.text_color || '#F3F4F6';
  const hpBorder = colors?.hp_color?.border || '#DC2626';
  const acBorder = colors?.ac_color?.border || '#6B7280';

  // Build gradient string from border colors
  const gradientString = `linear-gradient(135deg, ${borderColors.join(', ')})`;

  // Parse stats
  const hp = character.stats?.hp || character.level ? Math.floor((character.level || 1) * 8) : 0;
  const ac = character.stats?.ac || 10 + Math.floor((character.level || 1) / 4);
  const level = character.level || 1;

  if (variant === 'compact') {
    return (
      <div
        className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border-2"
        style={{
          borderImage: gradientString,
          borderImageSlice: 1,
        }}
      >
        {/* Character Image */}
        {character.image_url && (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 flex-shrink-0">
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
          <h3
            className="text-sm font-bold truncate"
            style={{ color: textColor }}
          >
            {character.name}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {character.class_name && character.race
              ? `${character.class_name} - ${character.race}`
              : character.class_name || character.race || 'Adventurer'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-shrink-0">
          <div
            className="px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: hpBorder }}
          >
            HP {hp}
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: acBorder }}
          >
            AC {ac}
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className="bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden border-4"
      style={{
        borderImage: gradientString,
        borderImageSlice: 1,
      }}
    >
      {/* Character Image */}
      <div className="relative w-full h-40 bg-gray-800">
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
              className="w-16 h-16 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}

        {/* Level Badge */}
        <div
          className="absolute top-2 right-2 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg"
          style={{ background: gradientString }}
        >
          Level {level}
        </div>
      </div>

      {/* Character Info */}
      <div className="p-4">
        {/* Name */}
        <h3
          className="text-2xl font-bold mb-2 truncate"
          style={{ color: textColor }}
        >
          {character.name}
        </h3>

        {/* Class and Race */}
        <div className="mb-3 space-y-1">
          {character.class_name && (
            <p className="text-sm text-gray-300">
              <span className="text-gray-400">Class:</span> {character.class_name}
            </p>
          )}
          {character.race && (
            <p className="text-sm text-gray-300">
              <span className="text-gray-400">Race:</span> {character.race}
            </p>
          )}
          {character.player_name && (
            <p className="text-sm text-gray-300">
              <span className="text-gray-400">Player:</span> {character.player_name}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div
            className="flex-1 px-4 py-3 rounded-lg text-center border-2"
            style={{
              borderColor: hpBorder,
              backgroundColor: `${hpBorder}20`,
            }}
          >
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">HP</div>
            <div className="text-2xl font-bold" style={{ color: textColor }}>
              {hp}
            </div>
          </div>
          <div
            className="flex-1 px-4 py-3 rounded-lg text-center border-2"
            style={{
              borderColor: acBorder,
              backgroundColor: `${acBorder}20`,
            }}
          >
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">AC</div>
            <div className="text-2xl font-bold" style={{ color: textColor }}>
              {ac}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {character.is_active && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
