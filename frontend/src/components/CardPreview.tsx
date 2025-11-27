'use client';

interface Stat {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

interface Badge {
  stat: string;
  x: number;
  y: number;
  size?: number;
  rotation?: number;
  shape?: string;
}

interface Layout {
  card_type: 'simple' | 'enhanced';
  stats_config: Stat[];
  image_width_percent: number;
  image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  background_image_url?: string;
  background_image_offset_x?: number;
  background_image_offset_y?: number;
  border_colors: string[];
  badge_colors: string[];
  text_color: string;
  badge_layout: Badge[];
}

export default function CardPreview({ layout }: { layout: Layout }) {
  const borderStyle = {
    borderLeft: `4px solid ${layout.border_colors[0]}`,
  };

  const textStyle = {
    color: layout.text_color,
  };

  if (layout.card_type === 'simple') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow h-full" style={borderStyle}>
        {/* Image Placeholder */}
        <div
          className={`w-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400`}
          style={{ height: '200px' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <div className="text-sm">Character Image</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2" style={textStyle}>
            Character Name
          </h3>

          <div className="space-y-1 mb-3 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Class:</span>{' '}
              <span className="text-gray-900 dark:text-gray-100">Wizard</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Race:</span>{' '}
              <span className="text-gray-900 dark:text-gray-100">Elf</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: layout.badge_colors[0] || '#3b82f6' }}
            >
              Level 5
            </span>
          </div>

          {/* Player Name */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            Player: John
          </p>
        </div>
      </div>
    );
  }

  // Enhanced Card - shows background image with character image and badges positioned on it
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
      style={borderStyle}
    >
      {/* Background Image Container with Badge Overlay */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '300px',
          backgroundImage: layout.background_image_url
            ? `url('${layout.background_image_url}')`
            : 'linear-gradient(135deg, rgb(229, 231, 235), rgb(209, 213, 219))',
          backgroundSize: 'cover',
          backgroundPosition: `calc(50% + ${layout?.background_image_offset_x || 0}%) calc(50% + ${layout?.background_image_offset_y || 0}%)`,
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Character Image - positioned at top-left with configurable width */}
        <div
          className="absolute left-4 top-4 rounded-lg overflow-hidden shadow-lg border-2 group-hover:scale-105 transition-transform"
          style={{
            width: `${layout.image_width_percent || 30}%`,
            height: `${layout.image_width_percent || 30}%`,
            borderColor: layout.border_colors[0],
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <div className="text-2xl">📸</div>
          </div>
        </div>

        {/* Badge Overlay - positioned badges from layout configuration */}
        {layout.badge_layout && layout.badge_layout.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {layout.badge_layout.map((badge: any, idx: number) => (
              <div
                key={badge.stat}
                className="absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white"
                style={{
                  left: `${badge.x}%`,
                  top: `${badge.y}%`,
                  backgroundColor: layout.badge_colors[idx % layout.badge_colors.length],
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {badge.stat[0].toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Name */}
        <h3
          className="text-lg font-bold mb-2 line-clamp-2"
          style={textStyle}
        >
          Character Name
        </h3>

        {/* Class and Race */}
        <div className="space-y-1 mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Class:</span> Wizard
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Race:</span> Elf
          </p>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: layout.badge_colors[0] }}
          >
            Level 5
          </span>
        </div>

        {/* Player Name */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          Player: John
        </p>
      </div>
    </div>
  );
}
