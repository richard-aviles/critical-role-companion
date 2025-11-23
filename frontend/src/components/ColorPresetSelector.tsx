'use client';

import { useState } from 'react';

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  borderColors: string[];
  textColor: string;
  badgeInteriorGradient: {
    type: string;
    colors: string[];
  };
  hpColor: {
    border: string;
    interiorGradient: {
      type: string;
      colors: string[];
    };
  };
  acColor: {
    border: string;
    interiorGradient: {
      type: string;
      colors: string[];
    };
  };
}

interface ColorPresetSelectorProps {
  presets: ColorPreset[];
  selectedPresetId?: string;
  onPresetSelect: (preset: ColorPreset) => void;
  showCustomOption?: boolean;
}

export const ColorPresetSelector: React.FC<ColorPresetSelectorProps> = ({
  presets,
  selectedPresetId,
  onPresetSelect,
  showCustomOption = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Color Theme Presets
      </label>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className={`relative rounded-lg border-2 p-4 transition-all text-left ${
              selectedPresetId === preset.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Selection Indicator */}
            {selectedPresetId === preset.id && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Preset Name */}
            <h3 className="font-semibold text-gray-900 mb-1 pr-6">{preset.name}</h3>

            {/* Preset Description */}
            <p className="text-xs text-gray-600 mb-3">{preset.description}</p>

            {/* Color Preview */}
            <div className="flex items-center gap-2">
              {/* Border Colors Preview */}
              <div className="flex gap-1">
                {preset.borderColors.slice(0, 4).map((color, idx) => (
                  <div
                    key={idx}
                    className="h-6 w-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Text & Badge Preview */}
              <div className="flex gap-1 ml-1">
                {/* Text Color */}
                <div
                  className="h-6 w-4 rounded border border-gray-300"
                  style={{ backgroundColor: preset.textColor }}
                  title={`Text: ${preset.textColor}`}
                />
                {/* Badge Interior */}
                <div
                  className="h-6 w-4 rounded border border-gray-300"
                  style={{
                    backgroundColor: preset.badgeInteriorGradient.colors[0],
                  }}
                  title={`Badge: ${preset.badgeInteriorGradient.colors[0]}`}
                />
              </div>
            </div>
          </button>
        ))}

        {/* Custom Option */}
        {showCustomOption && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-lg border-2 p-4 transition-all text-left ${
              selectedPresetId === 'custom'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {selectedPresetId === 'custom' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <h3 className="font-semibold text-gray-900 mb-1 pr-6">Custom Colors</h3>
            <p className="text-xs text-gray-600">Create your own color scheme</p>

            {/* Palette Icon */}
            <div className="mt-3 flex justify-center">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .267M7 21H5a2 2 0 01-2-2v-4a2 2 0 012-2h2.5M9 3h6a2 2 0 012 2v12a4 4 0 01-4 4h-2.5"
                />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 italic">
        Select a preset color scheme or choose custom to create your own colors
      </p>
    </div>
  );
};
