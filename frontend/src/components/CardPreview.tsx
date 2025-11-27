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

  // Enhanced Card - shows background image with badge positioning overlay
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow" style={borderStyle}>
      {/* Background + Badge Positioning Canvas */}
      <div
        className="relative w-full"
        style={{
          height: '300px',
          backgroundImage: layout.background_image_url
            ? `url(${layout.background_image_url})`
            : 'linear-gradient(135deg, rgb(229, 231, 235), rgb(209, 213, 219))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Character Image Container - positioned at top-left */}
        <div
          className="absolute left-4 top-4 rounded-lg overflow-hidden shadow-lg border-2"
          style={{
            width: `${layout.image_width_percent}%`,
            height: '120px',
            borderColor: layout.border_colors[0],
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <div className="text-2xl">📸</div>
          </div>
        </div>

        {/* Badge Preview Area - Show All Badges */}
        {layout.badge_layout.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {layout.badge_layout.map((badge, idx) => (
              <div
                key={badge.stat}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white"
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

        {/* Help Text if no badges */}
        {layout.badge_layout.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white text-sm font-medium drop-shadow-lg">
              <p>No badges configured</p>
              <p className="text-xs opacity-80">Configure badges below</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold mb-2 line-clamp-2" style={textStyle}>
          Character Name
        </h3>

        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            <span className="font-medium">Class:</span> Wizard
          </div>
          <div>
            <span className="font-medium">Race:</span> Elf
          </div>
          <div>
            <span className="font-medium">Level:</span> 5
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="px-4 pb-4 text-xs text-gray-500 dark:text-gray-400">
        {layout.badge_layout.length === 0 && (
          <div className="text-purple-600 dark:text-purple-400">Configure badge positions to see preview</div>
        )}
      </div>
    </div>
  );
}
