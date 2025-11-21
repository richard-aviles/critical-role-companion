/**
 * Character Form Component
 * Reusable form for creating and editing characters
 */

'use client';

import { useState, useEffect } from 'react';
import { Character, CreateCharacterData, UpdateCharacterData } from '@/lib/api';
import { ImageUploadField } from './ImageUploadField';

interface CharacterFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  initialData?: Character;
  onSubmit: (data: CreateCharacterData | UpdateCharacterData, imageFile?: File) => Promise<void>;
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
    level: initialData?.level || 1,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);

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

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const clampedValue = Math.max(1, Math.min(20, value));
    setFormData((prev) => ({ ...prev, level: clampedValue }));
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
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

    if (formData.level < 1 || formData.level > 20) {
      setError('Level must be between 1 and 20');
      return;
    }

    try {
      // Prepare data for submission
      const submitData: CreateCharacterData | UpdateCharacterData = mode === 'create'
        ? {
            campaign_id: campaignId!,
            name: formData.name.trim(),
            class_name: formData.class_name.trim() || undefined,
            race: formData.race.trim() || undefined,
            player_name: formData.player_name.trim() || undefined,
            description: formData.description.trim() || undefined,
            backstory: formData.backstory.trim() || undefined,
            level: formData.level,
          }
        : {
            name: formData.name.trim(),
            class_name: formData.class_name.trim() || undefined,
            race: formData.race.trim() || undefined,
            player_name: formData.player_name.trim() || undefined,
            description: formData.description.trim() || undefined,
            backstory: formData.backstory.trim() || undefined,
            level: formData.level,
          };

      await onSubmit(submitData, selectedImage || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save character');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Character Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Player Name and Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            Level (1-20)
          </label>
          <input
            id="level"
            name="level"
            type="number"
            min="1"
            max="20"
            value={formData.level}
            onChange={handleLevelChange}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
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
          placeholder="Brief character description..."
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
          placeholder="Character backstory and history..."
          rows={5}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Image Upload */}
      <ImageUploadField
        onFileSelect={handleImageSelect}
        initialImage={initialData?.image_url}
        label="Character Image"
        disabled={isLoading}
      />

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
            className="px-6 rounded-md border border-gray-300 py-2 text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
