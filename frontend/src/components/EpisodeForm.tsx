/**
 * Episode Form Component
 * Reusable form for create and edit modes
 */

'use client';

import { useState, useEffect } from 'react';
import { Episode, CreateEpisodeData, UpdateEpisodeData } from '@/lib/api';

interface EpisodeFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  initialData?: Episode;
  onSubmit: (data: CreateEpisodeData | UpdateEpisodeData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const EpisodeForm: React.FC<EpisodeFormProps> = ({
  mode,
  campaignId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    episode_number: initialData?.episode_number?.toString() || '',
    season: initialData?.season?.toString() || '',
    description: initialData?.description || '',
    air_date: initialData?.air_date || '',
    runtime: initialData?.runtime?.toString() || '',
    is_published: initialData?.is_published || false,
  });

  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && formData.name && mode === 'create') {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugTouched, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError(null);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugTouched(true);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Episode name is required');
      return false;
    }

    if (mode === 'create' && !formData.slug.trim()) {
      setError('Episode slug is required');
      return false;
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }

    if (formData.episode_number && parseInt(formData.episode_number) < 1) {
      setError('Episode number must be a positive integer');
      return false;
    }

    if (formData.season && parseInt(formData.season) < 1) {
      setError('Season must be a positive integer');
      return false;
    }

    if (formData.runtime && parseInt(formData.runtime) < 1) {
      setError('Runtime must be a positive number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: any = {
        name: formData.name,
        description: formData.description || undefined,
        is_published: formData.is_published,
      };

      if (mode === 'create') {
        submitData.campaign_id = campaignId;
        submitData.slug = formData.slug;
      }

      if (formData.slug) {
        submitData.slug = formData.slug;
      }

      if (formData.episode_number) {
        submitData.episode_number = parseInt(formData.episode_number);
      }

      if (formData.season) {
        submitData.season = parseInt(formData.season);
      }

      if (formData.air_date) {
        submitData.air_date = formData.air_date;
      }

      if (formData.runtime) {
        submitData.runtime = parseInt(formData.runtime);
      }

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to save episode');
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

      {/* Episode Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Episode Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Arrival at Kraghammer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          required
        />
      </div>

      {/* Episode Slug (only for create or show in edit) */}
      {mode === 'create' && (
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Episode Slug *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            disabled={isLoading}
            placeholder="e.g., arrival-at-kraghammer"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            pattern="^[a-z0-9-]+$"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            URL-friendly identifier (lowercase, numbers, hyphens only)
          </p>
        </div>
      )}

      {/* Episode Number and Season */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="episode_number" className="block text-sm font-medium text-gray-700">
            Episode Number
          </label>
          <input
            id="episode_number"
            name="episode_number"
            type="number"
            min="1"
            value={formData.episode_number}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., 1"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">
            Season
          </label>
          <input
            id="season"
            name="season"
            type="number"
            min="1"
            value={formData.season}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., 1"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Air Date and Runtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="air_date" className="block text-sm font-medium text-gray-700">
            Air Date
          </label>
          <input
            id="air_date"
            name="air_date"
            type="date"
            value={formData.air_date}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="runtime" className="block text-sm font-medium text-gray-700">
            Runtime (minutes)
          </label>
          <input
            id="runtime"
            name="runtime"
            type="number"
            min="1"
            value={formData.runtime}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., 180"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
          placeholder="Episode summary and key events..."
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Published Checkbox */}
      <div className="flex items-center">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          checked={formData.is_published}
          onChange={handleChange}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-50"
        />
        <label htmlFor="is_published" className="ml-2 block text-sm font-medium text-gray-700">
          Published
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">◌</span>
              Saving...
            </span>
          ) : mode === 'create' ? (
            'Create Episode'
          ) : (
            'Update Episode'
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
