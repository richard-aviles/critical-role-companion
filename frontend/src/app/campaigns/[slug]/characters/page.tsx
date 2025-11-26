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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50 dark:from-gray-950 dark:via-sky-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-sky-700 dark:border-sky-500 border-t-transparent rounded-full mx-auto shadow-lg"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading characters...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50 dark:from-gray-950 dark:via-sky-950/20 dark:to-blue-950/20">
        <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-elevated p-8 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The campaign you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50 dark:from-gray-950 dark:via-sky-950/20 dark:to-blue-950/20">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-sky-200 dark:border-sky-900/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${slug}`} className="hover:text-sky-700 dark:hover:text-sky-400 transition-colors font-medium">
              {campaign.name}
            </Link>
            <span>/</span>
            <span className="text-sky-700 dark:text-sky-300 font-semibold">Characters</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-700 to-blue-700 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">Character Roster</h1>
          <p className="mt-2 text-gray-700 dark:text-gray-300 font-medium">
            Meet the heroes of {campaign.name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {characters.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800">
            <svg className="mx-auto h-16 w-16 text-sky-400 dark:text-sky-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 font-medium">
              No characters found for this campaign yet.
            </p>
            <Link
              href={`/campaigns/${slug}`}
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5"
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
              <div className="text-center py-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
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
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-sky-800/50 dark:border-sky-900/30">
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
