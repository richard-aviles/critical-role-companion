/**
 * Character List Page
 * Display all characters for a campaign in a grid layout
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Character, getCharacters } from '@/lib/api';
import { CharacterCard, CharacterCardSkeleton } from '@/components/CharacterCard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';

function CharacterListContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const campaignId = params.id;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch characters on mount
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!campaignId) {
        setError('Campaign ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getCharacters(campaignId);
        setCharacters(data);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          setError('Campaign not found');
        } else if (status === 403) {
          setError('You do not have permission to view these characters');
        } else {
          setError(err.message || 'Failed to load characters');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [campaignId]);

  const handleViewCharacter = (characterId: string) => {
    router.push(`/admin/campaigns/${campaignId}/characters/${characterId}`);
  };

  const handleEditCharacter = (characterId: string) => {
    router.push(`/admin/campaigns/${campaignId}/characters/${characterId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AdminHeader title="Characters" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Loading characters...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AdminHeader title="Characters" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
              Error Loading Characters
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition-colors"
              >
                Back to Campaign
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasCharacters = characters.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader title="Characters" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with count and actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              {hasCharacters
                ? `${characters.length} character${characters.length > 1 ? 's' : ''}`
                : 'No characters yet'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Back to Campaign
            </button>
            <button
              onClick={() => router.push(`/admin/campaigns/${campaignId}/characters/new`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold transition-colors"
            >
              + Add Character
            </button>
          </div>
        </div>

        {/* Character Grid */}
        {hasCharacters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onView={() => handleViewCharacter(character.id)}
                onEdit={() => handleEditCharacter(character.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No characters yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first character to start tracking the party members and their adventures.
            </p>
            <button
              onClick={() => router.push(`/admin/campaigns/${campaignId}/characters/new`)}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold transition-colors"
            >
              Add Character
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CharacterListPage() {
  return (
    <ProtectedRoute>
      <CharacterListContent />
    </ProtectedRoute>
  );
}
