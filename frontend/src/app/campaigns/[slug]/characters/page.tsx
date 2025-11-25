/**
 * Public Character Roster Page
 * Displays all active characters for a campaign with search/filter
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPublicCampaign, getPublicCharacters, Character } from '@/lib/api';
import { CharacterSearch } from '@/components/CharacterSearch';
import { PublicCharacterCard } from '@/components/PublicCharacterCard';

function CharacterRosterPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug;

  // Fetch campaign and characters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch campaign and characters in parallel
        const [campaignData, charactersData] = await Promise.all([
          getPublicCampaign(slug),
          getPublicCharacters(slug),
        ]);

        setCampaign(campaignData);
        setCharacters(charactersData);
        setFilteredCharacters(charactersData); // Initialize with all characters
      } catch (err: any) {
        setError(err.message || 'Failed to load characters');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${slug}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {campaign.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">Characters</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Character Roster</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Meet the heroes of {campaign.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {characters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              No characters found for this campaign yet.
            </p>
            <Link
              href={`/campaigns/${slug}`}
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-semibold"
            >
              Back to Campaign
            </Link>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <CharacterSearch
              characters={characters}
              onFilteredCharactersChange={setFilteredCharacters}
            />

            {/* Character Grid */}
            {filteredCharacters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No characters match your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharacters.map((character) => (
                  <PublicCharacterCard
                    key={character.id}
                    character={character}
                    campaignSlug={slug}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CharacterRosterPage() {
  return <CharacterRosterPageContent />;
}
