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
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow" style={borderStyle}>
        {/* Image Placeholder */}
        <div
          className={`w-full ${getImageHeight()} bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600`}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <div className="text-sm">Character Image</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold mb-3" style={textStyle}>
            Character Name
          </h3>

          <div className="space-y-1 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Class:</span>{' '}
              <span className="text-gray-900">Wizard</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Race:</span>{' '}
              <span className="text-gray-900">Elf</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Player:</span>{' '}
              <span className="text-gray-900">John</span>
            </div>
          </div>

          {/* Stats List (Simple) */}
          <div className="text-xs text-gray-600 space-y-1 mb-4">
            {visibleStats.map((stat) => (
              <div key={stat.key}>
                {stat.label}: <span className="font-medium">10</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              View
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Card
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow" style={borderStyle}>
      {/* Background + Image Layout */}
      <div
        className="relative w-full h-64"
        style={{
          backgroundImage: layout.background_image_url
            ? `url(${layout.background_image_url})`
            : 'linear-gradient(135deg, rgb(229, 231, 235), rgb(209, 213, 219))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Character Image Container */}
        <div
          className={`absolute left-4 top-4 ${getImageHeight()} rounded-lg overflow-hidden shadow-lg border-2`}
          style={{
            width: `${layout.image_width_percent}%`,
            borderColor: layout.border_colors[0],
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600">
            <div className="text-3xl">📸</div>
          </div>
        </div>

        {/* Badge Preview Area */}
        {layout.badge_layout.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {layout.badge_layout.slice(0, 3).map((badge, idx) => (
              <div
                key={idx}
                className="absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{
                  left: `${badge.x}%`,
                  top: `${badge.y}%`,
                  backgroundColor: layout.border_colors[idx % layout.border_colors.length],
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {badge.stat[0].toUpperCase()}
              </div>
            ))}
            {layout.badge_layout.length > 3 && (
              <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                +{layout.badge_layout.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2" style={textStyle}>
          Character Name
        </h3>

        <div className="text-xs text-gray-600 space-y-1">
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
      <div className="px-4 pb-4 text-xs text-gray-500">
        {layout.badge_layout.length === 0 && (
          <div className="text-blue-600">Configure badge positions to see preview</div>
        )}
      </div>
    </div>
  );
}
