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
  border_colors: string[];
  badge_colors: string[];
  text_color: string;
  badge_layout: Badge[];
}

export default function CardPreview({ layout }: { layout: Layout }) {
  const getImageHeight = () => {
    switch (layout.image_aspect_ratio) {
      case 'portrait':
        return 'h-96';
      case 'landscape':
        return 'h-48';
      case 'square':
      default:
        return 'h-64';
    }
  };

  const visibleStats = layout.stats_config
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

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

  // Enhanced Card
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow h-full" style={borderStyle}>
      {/* Image Placeholder - matches PublicCharacterCard height of 280px for enhanced */}
      <div
        className="relative w-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400"
        style={{ height: '280px' }}
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
            style={{ backgroundColor: layout.badge_colors[0] || '#3b82f6' }}
          >
            Level 5
          </span>
        </div>

        {/* Stats Grid - matches PublicCharacterCard 3-column layout */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-2">
            {visibleStats.slice(0, 6).map((stat) => (
              <div key={stat.key} className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  {stat.label}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: textStyle.color }}
                >
                  10
                </p>
              </div>
            ))}
          </div>

          {/* HP and AC Badges */}
          <div className="flex gap-3 mt-3">
            <div
              className="flex-1 px-3 py-2 rounded text-center"
              style={{
                backgroundColor: layout.badge_colors[0] || '#3b82f6',
                opacity: 0.1
              }}
            >
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">HP</p>
              <p
                className="text-sm font-bold"
                style={{ color: textStyle.color }}
              >
                25
              </p>
            </div>
            <div
              className="flex-1 px-3 py-2 rounded text-center"
              style={{
                backgroundColor: layout.badge_colors[0] || '#3b82f6',
                opacity: 0.1
              }}
            >
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">AC</p>
              <p
                className="text-sm font-bold"
                style={{ color: textStyle.color }}
              >
                14
              </p>
            </div>
          </div>
        </div>

        {/* Player Name */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          Player: John
        </p>
      </div>
    </div>
  );
}
