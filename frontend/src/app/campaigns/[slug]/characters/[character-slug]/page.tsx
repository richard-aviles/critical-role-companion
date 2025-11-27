/**
 * Public Character Detail Page
 * Displays comprehensive character information with color styling
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicCharacter, getPublicCampaign, getPublicCampaignLayout } from '@/lib/api';

function CharacterDetailPageContent() {
  const params = useParams<{ slug: string; 'character-slug': string }>();
  const [character, setCharacter] = useState<any | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [layout, setLayout] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignSlug = params.slug;
  const characterSlug = params['character-slug'];

  // Fetch character, campaign, and layout data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [characterData, campaignData, layoutData] = await Promise.all([
          getPublicCharacter(campaignSlug, characterSlug),
          getPublicCampaign(campaignSlug),
          getPublicCampaignLayout(campaignSlug),
        ]);

        setCharacter(characterData);
        setCampaign(campaignData);
        setLayout(layoutData);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto shadow-primary"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading character...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !character || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
        <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-elevated p-8 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Character Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The character you are looking for does not exist.'}
          </p>
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 font-semibold shadow-primary hover:shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  // Get styling from color override
  const textColor = character.color_theme_override?.text_color || '#1f2937';
  const levelColor = character.color_theme_override?.text_color || '#FFFFFF';
  const borderColor = character.color_theme_override?.border_colors?.[0] || '#3b82f6';
  const accentBgColor = character.color_theme_override?.badge_interior_gradient?.colors?.[0] || '#dbeafe';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${campaignSlug}`} className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 font-medium">
              {campaign.name}
            </Link>
            <span>/</span>
            <Link
              href={`/campaigns/${campaignSlug}/characters`}
              className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 font-medium"
            >
              Characters
            </Link>
            <span>/</span>
            <span className="text-purple-700 dark:text-purple-300 font-semibold">{character.name}</span>
          </div>

          {/* Back button */}
          <Link
            href={`/campaigns/${campaignSlug}/characters`}
            className="text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-semibold flex items-center gap-1 transition-colors duration-200"
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
              className="relative w-full h-96 rounded-xl overflow-hidden shadow-elevated mb-6 border-4"
              style={{ borderColor }}
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
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30"
                  style={{ backgroundColor: accentBgColor }}
                >
                  <svg
                    className="w-24 h-24 text-purple-400 dark:text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              {character.level && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm mb-1 dark:text-gray-400" style={{ color: '#6b7280' }}>Level</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: levelColor }}
                  >
                    {character.level}
                  </p>
                </div>
              )}

              {character.class_name && (
                <div className="mb-4">
                  <p className="text-sm mb-1 dark:text-gray-400" style={{ color: '#6b7280' }}>Class</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {character.class_name}
                  </p>
                </div>
              )}

              {character.race && (
                <div className="mb-4">
                  <p className="text-sm mb-1 dark:text-gray-400" style={{ color: '#6b7280' }}>Race</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {character.race}
                  </p>
                </div>
              )}

              {character.player_name && (
                <div>
                  <p className="text-sm mb-1 dark:text-gray-400" style={{ color: '#6b7280' }}>Played By</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {character.race} {character.class_name}
                  {character.level && ` (Level ${character.level})`}
                </p>
              )}
            </div>

            {/* Description */}
            {character.description && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="h-1 w-8 bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-500 dark:to-purple-300 rounded-full"></span>
                  Overview
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {character.description}
                </p>
              </div>
            )}

            {/* Backstory */}
            {character.backstory && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="h-1 w-8 bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-500 dark:to-purple-300 rounded-full"></span>
                  Backstory
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {character.backstory}
                </p>
              </div>
            )}

            {/* Color Override Indicator */}
            {character.color_theme_override && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Character Theme</h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md border-2 border-white dark:border-gray-800"
                    style={{ backgroundColor: textColor }}
                  />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Custom Color Override Applied</p>
                    <p className="text-sm font-mono text-gray-500 dark:text-gray-500">{textColor}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-gray-800 dark:border-gray-900">
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
