'use client';

import { useState } from 'react';
import { ColorPresetSelector, ColorPreset } from './ColorPresetSelector';
import { ColorPickerModal } from './ColorPickerModal';

export interface ColorThemeOverride {
  border_colors: string[];
  text_color: string;
  badge_interior_gradient: {
    type: string;
    colors: string[];
  };
  hp_color: {
    border: string;
    interior_gradient: {
      type: string;
      colors: string[];
    };
  };
  ac_color: {
    border: string;
    interior_gradient: {
      type: string;
      colors: string[];
    };
  };
}

interface CharacterColorOverrideFormProps {
  initialColors?: ColorThemeOverride;
  presets: ColorPreset[];
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  onSubmit: (colors: ColorThemeOverride) => Promise<void>;
  onCancel?: () => void;
  onChange?: (colors: ColorThemeOverride) => void;
}

const DEFAULT_PRESET: ColorPreset = {
  id: 'option_a',
  name: 'Gold & Warmth',
  description: 'Warm gold tones with rich accents',
  borderColors: ['#FFD700', '#FFA500', '#FF8C00', '#DC7F2E'],
  textColor: '#FFFFFF',
  badgeInteriorGradient: {
    type: 'radial',
    colors: ['#FFE4B5', '#DAA520'],
  },
  hpColor: {
    border: '#FF0000',
    interiorGradient: {
      type: 'radial',
      colors: ['#FF6B6B', '#CC0000'],
    },
  },
  acColor: {
    border: '#808080',
    interiorGradient: {
      type: 'radial',
      colors: ['#A9A9A9', '#696969'],
    },
  },
};

/**
 * Convert ColorPreset (camelCase) to ColorThemeOverride (snake_case)
 * This is needed because the frontend uses camelCase for presets,
 * but the backend expects snake_case for the API.
 */
function presetToColorThemeOverride(preset: ColorPreset): ColorThemeOverride {
  return {
    border_colors: preset.borderColors,
    text_color: preset.textColor,
    badge_interior_gradient: preset.badgeInteriorGradient,
    hp_color: {
      border: preset.hpColor.border,
      interior_gradient: preset.hpColor.interiorGradient,
    },
    ac_color: {
      border: preset.acColor.border,
      interior_gradient: preset.acColor.interiorGradient,
    },
  };
}

export const CharacterColorOverrideForm: React.FC<
  CharacterColorOverrideFormProps
> = ({
  initialColors,
  presets,
  isLoading = false,
  mode = 'edit',
  onSubmit,
  onCancel,
  onChange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset | null>(
    initialColors ? null : presets[0] || DEFAULT_PRESET
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [customColors, setCustomColors] = useState<ColorThemeOverride>(
    initialColors || presetToColorThemeOverride(selectedPreset || DEFAULT_PRESET)
  );

  const [editingColorField, setEditingColorField] = useState<string | null>(
    null
  );
  const [editingColor, setEditingColor] = useState('#000000');

  const handlePresetSelect = (preset: ColorPreset) => {
    setSelectedPreset(preset);
    const newColors = presetToColorThemeOverride(preset);
    setCustomColors(newColors);
    // Auto-update parent in create mode
    if (mode === 'create' && onChange) {
      onChange(newColors);
    }
  };

  const handleCustomSelect = () => {
    setSelectedPreset(null);
    // Don't change customColors, keep current values
  };

  const handleColorEdit = (field: string, currentColor: string) => {
    setEditingColorField(field);
    setEditingColor(currentColor);
  };

  const handleColorConfirm = async (newColor: string) => {
    if (!editingColorField) return;

    const field = editingColorField;
    const updatedColors = { ...customColors };

    if (field === 'text_color') {
      updatedColors.text_color = newColor;
    } else if (field.startsWith('border_colors_')) {
      const idx = parseInt(field.split('_')[2]);
      updatedColors.border_colors[idx] = newColor;
    } else if (field.startsWith('hp_')) {
      const subField = field.replace('hp_', '');
      if (subField === 'border') {
        updatedColors.hp_color.border = newColor;
      } else if (subField.startsWith('gradient_')) {
        const colorIdx = parseInt(subField.split('_')[1]);
        updatedColors.hp_color.interior_gradient.colors[colorIdx] = newColor;
      }
    } else if (field.startsWith('ac_')) {
      const subField = field.replace('ac_', '');
      if (subField === 'border') {
        updatedColors.ac_color.border = newColor;
      } else if (subField.startsWith('gradient_')) {
        const colorIdx = parseInt(subField.split('_')[1]);
        updatedColors.ac_color.interior_gradient.colors[colorIdx] = newColor;
      }
    } else if (field.startsWith('badge_')) {
      const colorIdx = parseInt(field.split('_')[1]);
      updatedColors.badge_interior_gradient.colors[colorIdx] = newColor;
    }

    setCustomColors(updatedColors);
    setSelectedPreset(null);
    setEditingColorField(null);

    // Auto-update parent in create mode
    if (mode === 'create' && onChange) {
      onChange(updatedColors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <ColorPresetSelector
        presets={presets}
        selectedPresetId={selectedPreset?.id || 'custom'}
        onPresetSelect={handlePresetSelect}
        onCustomSelect={handleCustomSelect}
        showCustomOption
      />

      {/* Custom Color Editor */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Customize Colors
        </h3>

        {/* Text Color */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Color
          </label>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-md border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
              style={{ backgroundColor: customColors.text_color }}
              onClick={() =>
                handleColorEdit('text_color', customColors.text_color)
              }
            />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {customColors.text_color}
            </div>
            <button
              type="button"
              onClick={() =>
                handleColorEdit('text_color', customColors.text_color)
              }
              className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Border Colors */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Border Colors (Gradient)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {customColors.border_colors.map((color, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <div
                  className="h-8 w-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    handleColorEdit(`border_colors_${idx}`, color)
                  }
                />
                <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">{color}</div>
                <button
                  type="button"
                  onClick={() =>
                    handleColorEdit(`border_colors_${idx}`, color)
                  }
                  className="ml-auto text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Interior Gradient */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Badge Interior Colors
          </label>
          <div className="grid grid-cols-2 gap-3">
            {customColors.badge_interior_gradient.colors.map((color, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
              >
                <div
                  className="h-8 w-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorEdit(`badge_${idx}`, color)}
                />
                <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">{color}</div>
                <button
                  type="button"
                  onClick={() => handleColorEdit(`badge_${idx}`, color)}
                  className="ml-auto text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* HP Color */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            HP Badge Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">
                Border:
              </span>
              <div
                className="h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                style={{ backgroundColor: customColors.hp_color.border }}
                onClick={() =>
                  handleColorEdit('hp_border', customColors.hp_color.border)
                }
              />
              <div className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                {customColors.hp_color.border}
              </div>
              <button
                type="button"
                onClick={() =>
                  handleColorEdit('hp_border', customColors.hp_color.border)
                }
                className="ml-auto text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Edit
              </button>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">
                Gradient:
              </span>
              <div className="flex gap-2">
                {customColors.hp_color.interior_gradient.colors.map(
                  (color, idx) => (
                    <div
                      key={idx}
                      className="relative group"
                      onClick={() =>
                        handleColorEdit(`hp_gradient_${idx}`, color)
                      }
                    >
                      <div
                        className="h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                        style={{ backgroundColor: color }}
                      />
                      <div className="hidden group-hover:block absolute bottom-full left-0 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs p-1 rounded mb-1 whitespace-nowrap">
                        {color}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AC Color */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            AC Badge Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">
                Border:
              </span>
              <div
                className="h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                style={{ backgroundColor: customColors.ac_color.border }}
                onClick={() =>
                  handleColorEdit('ac_border', customColors.ac_color.border)
                }
              />
              <div className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                {customColors.ac_color.border}
              </div>
              <button
                type="button"
                onClick={() =>
                  handleColorEdit('ac_border', customColors.ac_color.border)
                }
                className="ml-auto text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Edit
              </button>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">
                Gradient:
              </span>
              <div className="flex gap-2">
                {customColors.ac_color.interior_gradient.colors.map(
                  (color, idx) => (
                    <div
                      key={idx}
                      className="relative group"
                      onClick={() =>
                        handleColorEdit(`ac_gradient_${idx}`, color)
                      }
                    >
                      <div
                        className="h-6 w-6 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500"
                        style={{ backgroundColor: color }}
                      />
                      <div className="hidden group-hover:block absolute bottom-full left-0 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs p-1 rounded mb-1 whitespace-nowrap">
                        {color}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions - Only shown in edit mode */}
      {mode === 'edit' && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={async () => {
              setIsSaving(true);
              setSaveSuccess(false);
              try {
                console.log('[ColorOverride] Saving colors:', customColors);
                await onSubmit(customColors);
                console.log('[ColorOverride] Colors saved successfully');
                setSaveSuccess(true);
                // Reset success state after 2 seconds
                setTimeout(() => setSaveSuccess(false), 2000);
              } catch (error) {
                console.error('[ColorOverride] Error saving colors:', error);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isLoading || isSaving}
            className={`flex-1 rounded-md py-2 px-4 text-white font-semibold transition-all ${
              saveSuccess
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">✓</span>
                Saved!
              </span>
            ) : (
              'Save Color Override'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Info message in create mode */}
      {mode === 'create' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Color changes will be saved when you create the character.
          </p>
        </div>
      )}

      {/* Color Picker Modal */}
      <ColorPickerModal
        title="Select Color"
        description="Choose a color or enter hex value manually"
        initialColor={editingColor}
        isOpen={editingColorField !== null}
        isLoading={isLoading}
        onConfirm={handleColorConfirm}
        onCancel={() => setEditingColorField(null)}
      />
    </div>
  );
};
