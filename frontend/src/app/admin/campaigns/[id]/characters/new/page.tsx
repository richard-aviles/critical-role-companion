/**
 * Create Character Page
 * Form to create a new character for a campaign
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createCharacter, CreateCharacterData, UpdateCharacterData, Character, updateCharacter } from '@/lib/api';
import { CharacterForm } from '@/components/CharacterForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';

function NewCharacterContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const campaignId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  const handleSubmit = async (data: CreateCharacterData | UpdateCharacterData, imageFile?: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, create the character with basic data
      const character = await createCharacter(data as CreateCharacterData);

      // If there's an image file, upload it separately
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          await updateCharacter(character.id, formData);
        } catch (imageErr: any) {
          // Character was created but image upload failed
          console.error('Image upload failed:', imageErr);
          // Still redirect to the character page, user can upload image later
        }
      }

      // Redirect to character detail page
      router.push(`/admin/campaigns/${campaignId}/characters/${character.id}`);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 403) {
        setError('You do not have permission to create characters for this campaign');
      } else if (status === 404) {
        setError('Campaign not found');
      } else {
        setError(err.message || 'Failed to create character');
      }
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/campaigns/${campaignId}/characters`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Create Character" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <li className="text-gray-900 font-medium">New</li>
          </ol>
        </nav>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Character
          </h2>

          {error && (
            <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <CharacterForm
            mode="create"
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default function NewCharacterPage() {
  return (
    <ProtectedRoute>
      <NewCharacterContent />
    </ProtectedRoute>
  );
}
