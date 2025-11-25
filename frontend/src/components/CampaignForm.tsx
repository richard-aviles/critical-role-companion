/**
 * Campaign Form Component
 * Used for creating and editing campaigns
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { checkSlugAvailability } from '@/lib/api';

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

interface SlugCheckState {
  checking: boolean;
  available: boolean | null;
  suggestions: string[];
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
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [slugCheck, setSlugCheck] = useState<SlugCheckState>({
    checking: false,
    available: null,
    suggestions: [],
  });
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate slug from name (create mode only)
  useEffect(() => {
    if (mode === 'create' && !slugTouched && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugTouched, mode]);

  // Check slug availability (debounced) - only in create mode
  useEffect(() => {
    if (mode !== 'create' || !formData.slug || !slugTouched) {
      return;
    }

    // Immediately show checking state
    setSlugCheck({
      checking: true,
      available: null,
      suggestions: [],
    });

    // Clear existing timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
    }

    // Set new timeout for debouncing (300ms)
    slugCheckTimeoutRef.current = setTimeout(async () => {
      try {
        console.log(`[Slug Check] Checking availability for: ${formData.slug}`);
        const result = await checkSlugAvailability(formData.slug);
        console.log(`[Slug Check] Result for ${formData.slug}:`, result);
        setSlugCheck({
          checking: false,
          available: result.available,
          suggestions: result.suggestions,
        });
      } catch (err) {
        console.error(`[Slug Check] Error checking ${formData.slug}:`, err);
        setSlugCheck({
          checking: false,
          available: null,
          suggestions: [],
        });
      }
    }, 300);

    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, [formData.slug, slugTouched, mode]);

  const isFormValid = formData.slug && formData.name && (mode === 'edit' || slugCheck.available);

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message - Phase 3: Error animations */}
      {(error || localError) && (
        <div className="error-message rounded-lg border p-5">
          <p className="text-base font-medium">{error || localError}</p>
        </div>
      )}

      {/* Campaign Name - Phase 3: Dark Mode */}
      <div className="animate-fade-in">
        <label htmlFor="name" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
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
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 text-base"
          required
        />
      </div>

      {/* Campaign Slug */}
      <div className="animate-fade-in delay-100">
        <label htmlFor="slug" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
          Campaign Slug *
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            disabled={isLoading}
            placeholder="e.g., exandria-campaign"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 text-base"
            pattern="^[a-z0-9-]+$"
            required
          />
          {mode === 'create' && slugTouched && formData.slug && (
            <div className="flex items-center">
              {slugCheck.checking ? (
                <div className="text-yellow-600 text-2xl animate-spin">⟳</div>
              ) : slugCheck.available ? (
                <div className="text-green-600 text-3xl font-bold" title="Slug is available">
                  ✓
                </div>
              ) : (
                <div className="text-red-600 text-3xl font-bold" title="Slug is taken">
                  ✕
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          URL-friendly identifier (lowercase, numbers, hyphens only)
        </p>

        {/* Slug Availability Status */}
        {mode === 'create' && slugTouched && formData.slug && (
          <div className="mt-2 space-y-2">
            {slugCheck.checking && (
              <p className="text-sm text-yellow-600">Checking availability...</p>
            )}
            {!slugCheck.checking && slugCheck.available === false && (
              <>
                <p className="text-sm text-red-600 font-medium">
                  This slug is already taken.
                </p>
                {slugCheck.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Try one of these:</p>
                    <div className="flex flex-wrap gap-2">
                      {slugCheck.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, slug: suggestion }));
                            setSlugCheck({
                              checking: false,
                              available: true,
                              suggestions: [],
                            });
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {!slugCheck.checking && slugCheck.available === true && (
              <p className="text-sm text-green-600 font-medium">
                ✓ This slug is available!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Campaign Description - Phase 3: Dark Mode */}
      <div className="animate-fade-in delay-200">
        <label htmlFor="description" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., A campaign set in the world of Exandria..."
          rows={5}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 text-base resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 animate-fade-in delay-300">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px] focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-base"
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
          className="px-8 rounded-lg border-2 border-gray-300 py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 active:scale-95 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 transition-all duration-200 min-h-[44px] focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 text-base"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
