'use client';

import { useState } from 'react';

const PRESETS = {
  option_a: {
    name: 'Gold & Warmth',
    borderColors: ['#FFD700', '#FFA500', '#FF8C00', '#DC7F2E'],
    badgeColors: ['#FFD700', '#DC7F2E'],
    textColor: '#FFFFFF',
    badgeInteriorGradient: {
      type: 'radial',
      colors: ['#FFE4B5', '#DAA520'],
    },
    hpColor: {
      border: '#FF0000',
      interior_gradient: {
        type: 'radial',
        colors: ['#FF6B6B', '#CC0000'],
      },
    },
    acColor: {
      border: '#808080',
      interior_gradient: {
        type: 'radial',
        colors: ['#A9A9A9', '#696969'],
      },
    },
  },
  option_b: {
    name: 'Twilight & Mystique',
    borderColors: ['#8B5CF6', '#6366F1', '#7C3AED', '#5B21B6'],
    badgeColors: ['#8B5CF6', '#5B21B6'],
    textColor: '#FFFFFF',
    badgeInteriorGradient: {
      type: 'radial',
      colors: ['#A78BFA', '#7C3AED'],
    },
    hpColor: {
      border: '#DC2626',
      interior_gradient: {
        type: 'radial',
        colors: ['#F87171', '#991B1B'],
      },
    },
    acColor: {
      border: '#6366F1',
      interior_gradient: {
        type: 'radial',
        colors: ['#A5B4FC', '#3730A3'],
      },
    },
  },
  option_c: {
    name: 'Emerald & Silver',
    borderColors: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
    badgeColors: ['#10B981', '#059669'],
    textColor: '#FFFFFF',
    badgeInteriorGradient: {
      type: 'radial',
      colors: ['#6EE7B7', '#10B981'],
    },
    hpColor: {
      border: '#EF4444',
      interior_gradient: {
        type: 'radial',
        colors: ['#FCA5A5', '#991B1B'],
      },
    },
    acColor: {
      border: '#0EA5E9',
      interior_gradient: {
        type: 'radial',
        colors: ['#7DD3FC', '#0369A1'],
      },
    },
  },
};

interface ColorThemeSelectorProps {
  borderColors: string[];
  badgeColors: string[];
  textColor: string;
  badgeInteriorGradient: Record<string, any>;
  hpColor: Record<string, any>;
  acColor: Record<string, any>;
  colorPreset?: string;
  onColorPresetChange?: (preset: string, colors: any) => void;
  onBorderColorsChange?: (colors: string[]) => void;
  onBadgeColorsChange?: (colors: string[]) => void;
  onTextColorChange?: (color: string) => void;
  onBadgeGradientChange?: (gradient: Record<string, any>) => void;
  onHpColorChange?: (color: Record<string, any>) => void;
  onAcColorChange?: (color: Record<string, any>) => void;
}

export default function ColorThemeSelector({
  borderColors,
  badgeColors,
  textColor,
  badgeInteriorGradient,
  hpColor,
  acColor,
  colorPreset,
  onColorPresetChange,
  onBorderColorsChange,
  onBadgeColorsChange,
  onTextColorChange,
  onBadgeGradientChange,
  onHpColorChange,
  onAcColorChange,
}: ColorThemeSelectorProps) {
  const [customMode, setCustomMode] = useState(!colorPreset || colorPreset === 'custom');

  const handlePresetChange = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setCustomMode(false);
    if (onColorPresetChange) {
      onColorPresetChange(presetKey, {
        border_colors: preset.borderColors,
        badge_colors: preset.badgeColors,
        text_color: preset.textColor,
        badge_interior_gradient: preset.badgeInteriorGradient,
        hp_color: preset.hpColor,
        ac_color: preset.acColor,
        color_preset: presetKey,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Presets</label>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key as keyof typeof PRESETS)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                colorPreset === key && !customMode
                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-800'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white mb-2">{preset.name}</div>
              <div className="flex gap-2">
                {preset.borderColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Mode */}
      <div>
        <button
          onClick={() => setCustomMode(!customMode)}
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          {customMode ? '▼' : '▶'} Custom Colors
        </button>

        {customMode && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Colors (Frame & Card)
              </label>
              <div className="flex gap-2">
                {borderColors.map((color, idx) => (
                  <div key={idx}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...borderColors];
                        newColors[idx] = e.target.value;
                        if (onBorderColorsChange) onBorderColorsChange(newColors);
                      }}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Badge Colors (Stat Badges)
              </label>
              <div className="flex gap-2">
                {badgeColors.map((color, idx) => (
                  <div key={idx}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...badgeColors];
                        newColors[idx] = e.target.value;
                        if (onBadgeColorsChange) onBadgeColorsChange(newColors);
                      }}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  if (onTextColorChange) onTextColorChange(e.target.value);
                }}
                className="w-12 h-12 rounded cursor-pointer"
              />
            </div>

            {/* HP Color Configuration */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                HP Badge Colors (Heart ❤️)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={hpColor?.border || '#FF0000'}
                    onChange={(e) => {
                      if (onHpColorChange) {
                        onHpColorChange({
                          ...hpColor,
                          border: e.target.value,
                        });
                      }
                    }}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Interior Gradient</label>
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Start</label>
                      <input
                        type="color"
                        value={hpColor?.interior_gradient?.colors?.[0] || '#FF6B6B'}
                        onChange={(e) => {
                          if (onHpColorChange) {
                            const colors = hpColor?.interior_gradient?.colors || ['#FF6B6B', '#CC0000'];
                            onHpColorChange({
                              ...hpColor,
                              interior_gradient: {
                                type: 'radial',
                                colors: [e.target.value, colors[1]],
                              },
                            });
                          }
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">End</label>
                      <input
                        type="color"
                        value={hpColor?.interior_gradient?.colors?.[1] || '#CC0000'}
                        onChange={(e) => {
                          if (onHpColorChange) {
                            const colors = hpColor?.interior_gradient?.colors || ['#FF6B6B', '#CC0000'];
                            onHpColorChange({
                              ...hpColor,
                              interior_gradient: {
                                type: 'radial',
                                colors: [colors[0], e.target.value],
                              },
                            });
                          }
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AC Color Configuration */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                AC Badge Colors (Shield 🛡️)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Color</label>
                  <input
                    type="color"
                    value={acColor?.border || '#808080'}
                    onChange={(e) => {
                      if (onAcColorChange) {
                        onAcColorChange({
                          ...acColor,
                          border: e.target.value,
                        });
                      }
                    }}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Interior Gradient</label>
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Start</label>
                      <input
                        type="color"
                        value={acColor?.interior_gradient?.colors?.[0] || '#A9A9A9'}
                        onChange={(e) => {
                          if (onAcColorChange) {
                            const colors = acColor?.interior_gradient?.colors || ['#A9A9A9', '#696969'];
                            onAcColorChange({
                              ...acColor,
                              interior_gradient: {
                                type: 'radial',
                                colors: [e.target.value, colors[1]],
                              },
                            });
                          }
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">End</label>
                      <input
                        type="color"
                        value={acColor?.interior_gradient?.colors?.[1] || '#696969'}
                        onChange={(e) => {
                          if (onAcColorChange) {
                            const colors = acColor?.interior_gradient?.colors || ['#A9A9A9', '#696969'];
                            onAcColorChange({
                              ...acColor,
                              interior_gradient: {
                                type: 'radial',
                                colors: [colors[0], e.target.value],
                              },
                            });
                          }
                        }}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
