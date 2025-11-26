'use client';

interface ImageSettingsPanelProps {
  widthPercent: number;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  backgroundImageUrl?: string;
  onWidthChange: (width: number) => void;
  onAspectRatioChange: (ratio: 'square' | 'portrait' | 'landscape') => void;
  onBackgroundImageChange: (url: string | undefined) => void;
}

export default function ImageSettingsPanel({
  widthPercent,
  aspectRatio,
  backgroundImageUrl,
  onWidthChange,
  onAspectRatioChange,
  onBackgroundImageChange,
}: ImageSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Image Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Character Image Width: {widthPercent}%
        </label>
        <input
          type="range"
          min="25"
          max="40"
          value={widthPercent}
          onChange={(e) => onWidthChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-2">
          Percentage of card width (25-40% recommended)
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Aspect Ratio</label>
        <div className="space-y-2">
          {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
            <label key={ratio} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="aspectRatio"
                value={ratio}
                checked={aspectRatio === ratio}
                onChange={() => onAspectRatioChange(ratio)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 capitalize">{ratio}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Background Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Image URL (Optional)
        </label>
        <input
          type="text"
          value={backgroundImageUrl || ''}
          onChange={(e) => onBackgroundImageChange(e.target.value || undefined)}
          placeholder="https://example.com/background.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-2">
          URL to background image (enhanced cards only)
        </div>
      </div>
    </div>
  );
}
