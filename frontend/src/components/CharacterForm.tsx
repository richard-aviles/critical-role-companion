/**
 * Character Form Component
 * Reusable form for creating and editing characters with optional color overrides
 */

'use client';

import { useState, useEffect } from 'react';
import { Character, CreateCharacterData, UpdateCharacterData, ColorThemeOverride } from '@/lib/api';
import { ImageUploadField } from './ImageUploadField';
import { BackgroundImageUploadField } from './BackgroundImageUploadField';
import { CharacterColorOverrideForm } from './CharacterColorOverrideForm';
import { ColorPreset } from './ColorPresetSelector';

// Default color presets
const COLOR_PRESETS: ColorPreset[] = [
  {
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
  },
  {
    id: 'option_b',
    name: 'Twilight & Mystique',
    description: 'Cool purples and deep blues',
    borderColors: ['#9370DB', '#6A5ACD', '#483D8B', '#36213E'],
    textColor: '#E6E6FA',
    badgeInteriorGradient: {
      type: 'radial',
      colors: ['#B19CD9', '#6A5ACD'],
    },
    hpColor: {
      border: '#DC143C',
      interiorGradient: {
        type: 'radial',
        colors: ['#FF69B4', '#C71585'],
      },
    },
    acColor: {
      border: '#4B0082',
      interiorGradient: {
        type: 'radial',
        colors: ['#9370DB', '#6A5ACD'],
      },
    },
  },
  {
    id: 'option_c',
    name: 'Emerald & Silver',
    description: 'Fresh greens with silvery accents',
    borderColors: ['#50C878', '#3CB371', '#228B22', '#1B4D2C'],
    textColor: '#F0FFF0',
    badgeInteriorGradient: {
      type: 'radial',
      colors: ['#90EE90', '#3CB371'],
    },
    hpColor: {
      border: '#FF1744',
      interiorGradient: {
        type: 'radial',
        colors: ['#FF5252', '#D32F2F'],
      },
    },
    acColor: {
      border: '#C0C0C0',
      interiorGradient: {
        type: 'radial',
        colors: ['#E8E8E8', '#A9A9A9'],
      },
    },
  },
];

interface CharacterFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  initialData?: Character;
  onSubmit: (data: CreateCharacterData | UpdateCharacterData, imageFile?: File, backgroundImageFile?: File) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  mode,
  campaignId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    class_name: initialData?.class_name || '',
    race: initialData?.race || '',
    player_name: initialData?.player_name || '',
    description: initialData?.description || '',
    backstory: initialData?.backstory || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<File | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | undefined>(initialData?.background_image_url);
  const [isBackgroundImageLoading, setIsBackgroundImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [useColorOverride, setUseColorOverride] = useState(!!initialData?.color_theme_override);
  const [colorOverride, setColorOverride] = useState<ColorThemeOverride | undefined>(
    initialData?.color_theme_override || undefined
  );

  // Validate form
  const isFormValid = formData.name.trim().length > 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);

    if (name === 'name') {
      setNameTouched(true);
    }
  };


  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
  };

  const handleBackgroundImageFileSelect = (file: File | null) => {
    setSelectedBackgroundImage(file);
    setError(null);
  };

  const handleBackgroundImageChange = (url: string | undefined) => {
    setBackgroundImageUrl(url);
    setError(null);
  };

  const handleBackgroundImageLoading = (loading: boolean) => {
    setIsBackgroundImageLoading(loading);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Character name is required');
      return;
    }

    if (mode === 'create' && !campaignId) {
      setError('Campaign ID is required for creating a character');
      return;
    }

    try {
      // Prepare data for submission
      const baseData = {
        name: formData.name.trim(),
        class_name: formData.class_name.trim() || undefined,
        race: formData.race.trim() || undefined,
        player_name: formData.player_name.trim() || undefined,
        description: formData.description.trim() || undefined,
        backstory: formData.backstory.trim() || undefined,
      };

      // Handle color override: explicitly send null if unchecked, or the colors if checked
      const colorThemeData = useColorOverride && colorOverride
        ? { color_theme_override: colorOverride }
        : { color_theme_override: null };

      const submitData: CreateCharacterData | UpdateCharacterData = mode === 'create'
        ? {
            campaign_id: campaignId!,
            ...baseData,
            ...colorThemeData,
          }
        : {
            ...baseData,
            ...colorThemeData,
          };

      console.log('[CharacterForm] Submitting data:', {
        mode,
        useColorOverride,
        colorOverride,
        submitData,
      });

      await onSubmit(submitData, selectedImage || undefined, selectedBackgroundImage || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save character');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Character Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Character Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Jester Lavorre"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
          required
        />
      </div>

      {/* Class and Race (side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character Class */}
        <div>
          <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">
            Class
          </label>
          <input
            id="class_name"
            name="class_name"
            type="text"
            value={formData.class_name}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., Rogue, Cleric"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
          />
        </div>

        {/* Race */}
        <div>
          <label htmlFor="race" className="block text-sm font-medium text-gray-700">
            Race
          </label>
          <input
            id="race"
            name="race"
            type="text"
            value={formData.race}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., Tiefling, Half-Elf"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
          />
        </div>
      </div>

      {/* Player Name */}
      <div>
        <label htmlFor="player_name" className="block text-sm font-medium text-gray-700">
          Player Name
        </label>
        <input
          id="player_name"
          name="player_name"
          type="text"
          value={formData.player_name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Laura Bailey"
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Character description and physical appearance..."
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
        />
      </div>

      {/* Backstory */}
      <div>
        <label htmlFor="backstory" className="block text-sm font-medium text-gray-700">
          Backstory
        </label>
        <textarea
          id="backstory"
          name="backstory"
          value={formData.backstory}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Character backstory and background..."
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400"
        />
      </div>

      {/* Color Theme Override Toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            id="use_color_override"
            type="checkbox"
            checked={useColorOverride}
            onChange={(e) => {
              setUseColorOverride(e.target.checked);
              if (!e.target.checked) {
                setColorOverride(undefined);
              } else if (mode === 'create' && !colorOverride) {
                // In create mode, initialize with default preset colors when checkbox is checked
                const defaultPreset = COLOR_PRESETS[0];
                const defaultColors = {
                  border_colors: defaultPreset.borderColors,
                  text_color: defaultPreset.textColor,
                  badge_interior_gradient: defaultPreset.badgeInteriorGradient,
                  hp_color: {
                    border: defaultPreset.hpColor.border,
                    interior_gradient: defaultPreset.hpColor.interiorGradient,
                  },
                  ac_color: {
                    border: defaultPreset.acColor.border,
                    interior_gradient: defaultPreset.acColor.interiorGradient,
                  },
                };
                setColorOverride(defaultColors);
              }
            }}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 dark:text-purple-500 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:bg-gray-50 dark:disabled:bg-gray-900"
          />
          <label htmlFor="use_color_override" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use custom color theme for this character
          </label>
        </div>

        {/* Color Override Form */}
        {useColorOverride && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <CharacterColorOverrideForm
              presets={COLOR_PRESETS}
              initialColors={colorOverride}
              isLoading={isLoading}
              mode={mode}
              onSubmit={async (colors) => {
                setColorOverride(colors);
              }}
              onCancel={() => {
                setUseColorOverride(false);
                setColorOverride(undefined);
              }}
              onChange={(colors) => {
                // In create mode, auto-update colors as user makes changes
                if (mode === 'create') {
                  setColorOverride(colors);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Image Upload */}
      <ImageUploadField
        onFileSelect={handleImageSelect}
        initialImage={initialData?.image_url}
        label="Character Portrait"
        disabled={isLoading}
      />

      {/* Background Image Upload */}
      <div className="border-t pt-6">
        <BackgroundImageUploadField
          imageUrl={backgroundImageUrl}
          onImageChange={handleBackgroundImageChange}
          onFileSelect={handleBackgroundImageFileSelect}
          onLoading={handleBackgroundImageLoading}
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 rounded-md bg-purple-600 dark:bg-purple-700 py-2 text-white font-medium hover:bg-purple-700 dark:hover:bg-purple-600 active:scale-95 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">◌</span>
              Saving...
            </span>
          ) : mode === 'create' ? (
            'Create Character'
          ) : (
            'Update Character'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 rounded-md border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all duration-200 focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
