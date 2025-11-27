/**
 * Create Character Page
 * Form to create a new character for a campaign
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createCharacter, CreateCharacterData, UpdateCharacterData, Character, updateCharacter } from '@/lib/api';
import { CharacterForm } from '@/components/CharacterForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';

function NewCharacterContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, campaigns, isLoading: isAuthLoading } = useAuth();
  const campaignId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Get campaign's admin token on mount
  useEffect(() => {
    // Find the campaign's admin_token from the campaigns list
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setAdminToken(campaign.admin_token);
    }
  }, [campaignId, campaigns]);

  // Redirect to login if not authenticated, only after auth has loaded
  useEffect(() => {
    if (isAuthLoading) {
      return; // Don't do anything while auth is loading
    }

    if (!user) {
      router.push('/admin/login');
      return;
    }

    setIsReady(true);
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (data: CreateCharacterData | UpdateCharacterData, imageFile?: File, backgroundImageFile?: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, create the character with basic data
      const character = await createCharacter(data as CreateCharacterData, adminToken || undefined);

      // If there's a portrait image file, upload it separately
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          await updateCharacter(campaignId, character.id, formData, undefined, adminToken || undefined);
        } catch (imageErr: any) {
          // Character was created but image upload failed
          console.error('Portrait image upload failed:', imageErr);
          // Still continue to try background image upload if present
        }
      }

      // If there's a background image file, upload it separately
      if (backgroundImageFile) {
        try {
          const { uploadCharacterBackgroundImage } = await import('@/lib/api');
          await uploadCharacterBackgroundImage(campaignId, character.id, backgroundImageFile, adminToken || undefined);
        } catch (bgImageErr: any) {
          // Character was created but background image upload failed
          console.error('Background image upload failed:', bgImageErr);
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

  if (isAuthLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <AdminHeader title="Create Character" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <li className="text-gray-900 dark:text-gray-100 font-medium">New</li>
          </ol>
        </nav>

        {/* Form Container */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 p-6 transition-all duration-200 border-l-4 border-l-purple-500">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Create New Character
          </h2>

          {error && (
            <div className="mb-6 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 backdrop-blur-sm p-4 shadow-lg border-l-4 border-l-red-500">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
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
