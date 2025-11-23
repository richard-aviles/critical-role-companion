/**
 * Public Character Detail Page
 * Displays comprehensive character information with color styling
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicCharacter, getPublicCampaign } from '@/lib/api';

function CharacterDetailPageContent() {
  const params = useParams<{ slug: string; 'character-slug': string }>();
  const [character, setCharacter] = useState<any | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignSlug = params.slug;
  const characterSlug = params['character-slug'];

  // Fetch character and campaign data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [characterData, campaignData] = await Promise.all([
          getPublicCharacter(campaignSlug, characterSlug),
          getPublicCampaign(campaignSlug),
        ]);

        setCharacter(characterData);
        setCampaign(campaignData);
      } catch (err: any) {
        setError(err.message || 'Failed to load character');
      } finally {
        setLoading(false);
      }
    };

    if (campaignSlug && characterSlug) {
      fetchData();
    }
  }, [campaignSlug, characterSlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading character...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !character || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Character Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The character you are looking for does not exist.'}
          </p>
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  // Get styling from color override
  const textColor = character.color_theme_override?.text_color || '#1f2937';
  const borderColor = character.color_theme_override?.border_colors?.[0] || '#3b82f6';
  const accentBgColor = character.color_theme_override?.badge_interior_gradient?.colors?.[0] || '#dbeafe';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href={`/campaigns/${campaignSlug}`} className="hover:text-blue-600">
              {campaign.name}
            </Link>
            <span>/</span>
            <Link
              href={`/campaigns/${campaignSlug}/characters`}
              className="hover:text-blue-600"
            >
              Characters
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{character.name}</span>
          </div>

          {/* Back button */}
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            ← Back to Roster
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image & Quick Info */}
          <div className="lg:col-span-1">
            {/* Character Image */}
            <div
              className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg mb-6"
              style={{ borderColor, borderWidth: '3px' }}
            >
              {character.image_url ? (
                <Image
                  src={character.image_url}
                  alt={character.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: accentBgColor }}
                >
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              {character.level && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Level</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: textColor }}
                  >
                    {character.level}
                  </p>
                </div>
              )}

              {character.class_name && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Class</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {character.class_name}
                  </p>
                </div>
              )}

              {character.race && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Race</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {character.race}
                  </p>
                </div>
              )}

              {character.player_name && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Played By</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {character.player_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2">
            {/* Character Name & Title */}
            <div className="mb-8">
              <h1
                className="text-4xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {character.name}
              </h1>
              {character.class_name && character.race && (
                <p className="text-xl text-gray-600">
                  {character.race} {character.class_name}
                  {character.level && ` (Level ${character.level})`}
                </p>
              )}
            </div>

            {/* Description */}
            {character.description && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {character.description}
                </p>
              </div>
            )}

            {/* Backstory */}
            {character.backstory && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Backstory</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {character.backstory}
                </p>
              </div>
            )}

            {/* Color Override Indicator */}
            {character.color_theme_override && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Character Theme</h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg shadow"
                    style={{ backgroundColor: textColor }}
                  />
                  <div>
                    <p className="text-sm text-gray-600">Custom Color Override Applied</p>
                    <p className="text-sm font-mono text-gray-500">{textColor}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CharacterDetailPage() {
  return <CharacterDetailPageContent />;
}
