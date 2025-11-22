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
  setAuthToken,
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

  // Set campaign auth token on mount
  useEffect(() => {
    // Find the campaign's admin_token from the campaigns list
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setAuthToken(campaign.admin_token);
    }
  }, [campaignId, campaigns]);

  // Fetch character on mount
  useEffect(() => {
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
        setCharacter(data);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          setError('Character not found. It may have been deleted.');
        } else if (status === 403) {
          setError('You do not have permission to view this character');
        } else {
          setError(err.message || 'Failed to load character');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

  const handleUpdate = async (data: UpdateCharacterData, imageFile?: File) => {
    setIsUpdating(true);
    setError(null);

    try {
      let updatedCharacter: Character;

      // If there's an image file, use FormData
      if (imageFile) {
        const formData = new FormData();

        // Append all character data fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        formData.append('image', imageFile);
        updatedCharacter = await updateCharacter(campaignId, characterId, formData);
      } else {
        // Otherwise use regular JSON data
        updatedCharacter = await updateCharacter(campaignId, characterId, data);
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
      await deleteCharacter(campaignId, characterId);
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


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading character...</p>
        </div>
      </div>
    );
  }

  // Error state or character not found
  if (error || !character) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Character Not Found" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {error || 'Character Not Found'}
            </h3>
            <p className="text-red-700 mb-4">
              {error || 'The character you are looking for does not exist or has been deleted.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}/characters`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Back to Characters
              </button>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title={character.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button
                onClick={() => router.push('/admin/campaigns')}
                className="hover:text-blue-600 transition-colors"
              >
                Campaigns
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
                className="hover:text-blue-600 transition-colors"
              >
                Campaign
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}/characters`)}
                className="hover:text-blue-600 transition-colors"
              >
                Characters
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{character.name}</li>
          </ol>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Main Layout: Image on left, details/form on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar: Image and Quick Info */}
          <div className="lg:col-span-1">
            {/* Character Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="relative w-full aspect-square bg-gray-200">
                <img
                  src={character.image_url || placeholderImage}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderImage;
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {character.name}
                </h2>
                {character.player_name && (
                  <p className="text-sm text-gray-600 mb-3">
                    Played by {character.player_name}
                  </p>
                )}
              </div>
            </div>

            {/* Character Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stats</h3>
              <dl className="space-y-3">
                {character.class_name && (
                  <div>
                    <dt className="text-sm text-gray-600">Class</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {character.class_name}
                    </dd>
                  </div>
                )}
                {character.race && (
                  <div>
                    <dt className="text-sm text-gray-600">Race</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {character.race}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Info</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600">Created</dt>
                  <dd className="text-gray-900">
                    {new Date(character.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Updated</dt>
                  <dd className="text-gray-900">
                    {new Date(character.updated_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Character ID</dt>
                  <dd className="text-xs text-gray-500 font-mono break-all">
                    {character.id}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Content: Details/Edit Form */}
          <div className="lg:col-span-2">
            {/* View/Edit Toggle */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {isEditing ? 'Edit Character' : 'Character Details'}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
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
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Description
                        </h4>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {character.description}
                        </p>
                      </div>
                    )}

                    {/* Backstory */}
                    {character.backstory && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Backstory
                        </h4>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {character.backstory}
                        </p>
                      </div>
                    )}

                    {/* If no description or backstory */}
                    {!character.description && !character.backstory && (
                      <p className="text-gray-500 italic">
                        No description or backstory available. Click "Edit" to add one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Deleting a character cannot be undone. All associated data will be lost.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
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
