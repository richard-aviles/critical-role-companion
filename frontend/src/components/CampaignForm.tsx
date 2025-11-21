/**
 * Campaign Form Component
 * Used for creating and editing campaigns
 */

'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id?: string;
  slug: string;
  name: string;
  description?: string;
}

interface CampaignFormProps {
  mode: 'create' | 'edit';
  initialData?: Campaign;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: Campaign) => Promise<void>;
  onCancel: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  mode,
  initialData,
  isLoading,
  error,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Campaign>({
    slug: initialData?.slug || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugTouched]);

  const isFormValid = formData.slug && formData.name;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugTouched(true);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!formData.name.trim()) {
      setLocalError('Campaign name is required');
      return;
    }

    if (!formData.slug.trim()) {
      setLocalError('Campaign slug is required');
      return;
    }

    // Slug validation: only lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setLocalError(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      // Error is handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {(error || localError) && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || localError}</p>
        </div>
      )}

      {/* Campaign Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Campaign Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Exandria Campaign"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          required
        />
      </div>

      {/* Campaign Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Campaign Slug *
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={formData.slug}
          onChange={handleSlugChange}
          disabled={isLoading}
          placeholder="e.g., exandria-campaign"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          pattern="^[a-z0-9-]+$"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          URL-friendly identifier (lowercase, numbers, hyphens only)
        </p>
      </div>

      {/* Campaign Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., A campaign set in the world of Exandria..."
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

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
            'Create Campaign'
          ) : (
            'Update Campaign'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 rounded-md border border-gray-300 py-2 text-gray-700 font-medium hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
