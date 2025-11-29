/**
 * Character Detail Page
 * View, edit, and delete a character
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Character,
  getCharacter,
  updateCharacter,
  deleteCharacter,
  UpdateCharacterData,
} from '@/lib/api';
import { CharacterForm } from '@/components/CharacterForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';

function CharacterDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string; characterId: string }>();
  const { user, campaigns } = useAuth();
  const campaignId = params.id;
  const characterId = params.characterId;

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Check for edit query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === 'true') {
        setIsEditing(true);
        // Remove the query parameter from URL without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Get campaign's admin token on mount
  useEffect(() => {
    // Find the campaign's admin_token from the campaigns list
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setAdminToken(campaign.admin_token);
    }
  }, [campaignId, campaigns]);

  // Fetch character on mount
  useEffect(() => {
    // Don't fetch if character is being deleted
    if (isDeleting) {
      return;
    }

    let isMounted = true;

    const fetchCharacter = async () => {
      if (!characterId) {
        setError('Character ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getCharacter(campaignId, characterId);
        if (isMounted && !isDeleting) {
          setCharacter(data);
        }
      } catch (err: any) {
        // Don't set error if we're in the process of deleting
        if (isDeleting || !isMounted) {
          return;
        }

        const status = err.response?.status;

        if (status === 404) {
          setError('Character not found. It may have been deleted.');
        } else if (status === 403) {
          setError('You do not have permission to view this character');
        } else {
          setError(err.message || 'Failed to load character');
        }
      } finally {
        if (isMounted && !isDeleting) {
          setLoading(false);
        }
      }
    };

    fetchCharacter();

    return () => {
      isMounted = false;
    };
  }, [characterId, isDeleting]);

  const handleUpdate = async (data: UpdateCharacterData, imageFile?: File, backgroundImageFile?: File) => {
    setIsUpdating(true);
    setError(null);

    try {
      let updatedCharacter: Character;

      // First, update text fields via JSON
      updatedCharacter = await updateCharacter(campaignId, characterId, data, undefined, adminToken || undefined);

      // Then, if there's a portrait image, upload it separately
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        updatedCharacter = await updateCharacter(campaignId, characterId, formData, imageFile, adminToken || undefined);
      }

      // Finally, if there's a background image, upload it separately
      if (backgroundImageFile) {
        const { uploadCharacterBackgroundImage } = await import('@/lib/api');
        updatedCharacter = await uploadCharacterBackgroundImage(campaignId, characterId, backgroundImageFile, adminToken || undefined);
      }

      setCharacter(updatedCharacter);
      setIsEditing(false);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 404) {
        setError('Character not found');
      } else if (status === 403) {
        setError('You do not have permission to update this character');
      } else {
        setError(err.message || 'Failed to update character');
      }
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteCharacter(campaignId, characterId, adminToken || undefined);
      // Redirect to characters list
      router.push(`/admin/campaigns/${campaignId}/characters`);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 404) {
        // Character already deleted, just redirect
        router.push(`/admin/campaigns/${campaignId}/characters`);
        return;
      } else if (status === 403) {
        setError('You do not have permission to delete this character');
      } else {
        setError(err.message || 'Failed to delete character');
      }
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };


  // Loading state or deleting
  if (loading || isDeleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{isDeleting ? 'Deleting character...' : 'Loading character...'}</p>
        </div>
      </div>
    );
  }

  // Error state or character not found (but not if deleting)
  if (error || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <AdminHeader title="Character Not Found" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-lg p-6 text-center shadow-lg border-l-4 border-l-red-500">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
              {error || 'Character Not Found'}
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-4">
              {error || 'The character you are looking for does not exist or has been deleted.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}/characters`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-semibold transition-all duration-200 shadow-lg focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
              >
                Back to Characters
              </button>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition-all duration-200 focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <AdminHeader title={character.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <li>
              <button
                onClick={() => router.push('/admin/campaigns')}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                Campaigns
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                Campaign
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}/characters`)}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
              >
                Characters
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">{character.name}</li>
          </ol>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 p-4 shadow-lg border-l-4 border-l-red-500">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Main Layout: Image on left, details/form on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar: Image and Quick Info */}
          <div className="lg:col-span-1">
            {/* Character Image */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-xl overflow-hidden mb-6 border border-purple-100 dark:border-purple-900/30 transition-all duration-200">
              <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={character.image_url || placeholderImage}
                  alt={character.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderImage;
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {character.name}
                </h2>
                {character.player_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Played by {character.player_name}
                  </p>
                )}
              </div>
            </div>

            {/* Character Stats */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-xl p-6 mb-6 border border-purple-100 dark:border-purple-900/30 transition-all duration-200 border-l-4 border-l-purple-500">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Stats</h3>
              <dl className="space-y-3">
                {character.class_name && (
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Class</dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {character.class_name}
                    </dd>
                  </div>
                )}
                {character.race && (
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Race</dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {character.race}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Timestamps */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-xl p-6 border border-purple-100 dark:border-purple-900/30 transition-all duration-200 border-l-4 border-l-purple-500">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Info</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Created</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {new Date(character.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Updated</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {new Date(character.updated_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Character ID</dt>
                  <dd className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    {character.id}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Content: Details/Edit Form */}
          <div className="lg:col-span-2">
            {/* View/Edit Toggle */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-xl mb-6 border border-purple-100 dark:border-purple-900/30 transition-all duration-200 border-l-4 border-l-purple-500">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Edit Character' : 'Character Details'}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-semibold transition-all duration-200 shadow-lg focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  /* Edit Mode: Show Form */
                  <CharacterForm
                    mode="edit"
                    initialData={character}
                    onSubmit={handleUpdate}
                    onCancel={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    isLoading={isUpdating}
                  />
                ) : (
                  /* View Mode: Show Details */
                  <div className="space-y-6">
                    {/* Description */}
                    {character.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {character.description}
                        </p>
                      </div>
                    )}

                    {/* Backstory */}
                    {character.backstory && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Backstory
                        </h4>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {character.backstory}
                        </p>
                      </div>
                    )}

                    {/* If no description or backstory */}
                    {!character.description && !character.backstory && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No description or backstory available. Click "Edit" to add one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/50 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-lg p-6 shadow-lg border-l-4 border-l-red-500 transition-all duration-200">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Deleting a character cannot be undone. All associated data will be lost.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 text-sm font-semibold transition-all duration-200 shadow-lg focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                Delete Character
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        title="Delete Character?"
        message={`Are you sure you want to delete "${character.name}"? This action cannot be undone.`}
        itemName={character.name}
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default function CharacterDetailPage() {
  return (
    <ProtectedRoute>
      <CharacterDetailContent />
    </ProtectedRoute>
  );
}
