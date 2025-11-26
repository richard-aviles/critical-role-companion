/**
 * Overlay Page for Live Streams
 * Minimal, stream-friendly display of campaign data
 * Designed for OBS/Streamlabs browser source
 * Auto-refreshes every 3 seconds for live updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getPublicCampaign,
  getOverlayRoster,
  getOverlayActiveEpisode,
  getOverlayEvents,
  OverlayCharacter,
  Event,
  OverlayActiveEpisode,
} from '@/lib/api';
import { OverlayCharacterCard } from '@/components/OverlayCharacterCard';
import { OverlayEventTimeline } from '@/components/OverlayEventTimeline';
import { OverlayRoster } from '@/components/OverlayRoster';

// Refresh interval in milliseconds (3 seconds)
const REFRESH_INTERVAL = 3000;

function OverlayPageContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;

  // URL parameters for customization
  const showRoster = searchParams.get('roster') !== 'false'; // Default: true
  const showEvents = searchParams.get('events') !== 'false'; // Default: true
  const showFeatured = searchParams.get('featured') !== 'false'; // Default: true
  const featuredCharacterSlug = searchParams.get('character'); // Optional: specific character
  const rosterLayout = (searchParams.get('layout') || 'grid') as 'horizontal' | 'vertical' | 'grid';
  const darkMode = searchParams.get('theme') !== 'light'; // Default: dark

  // State
  const [campaign, setCampaign] = useState<any | null>(null);
  const [characters, setCharacters] = useState<OverlayCharacter[]>([]);
  const [featuredCharacter, setFeaturedCharacter] = useState<OverlayCharacter | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<OverlayActiveEpisode | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch campaign info
      const campaignData = await getPublicCampaign(slug);
      setCampaign(campaignData);

      // Fetch roster with resolved colors
      const rosterData = await getOverlayRoster(slug);
      setCharacters(rosterData);

      // Set featured character
      if (featuredCharacterSlug) {
        const featured = rosterData.find((c) => c.slug === featuredCharacterSlug);
        setFeaturedCharacter(featured || null);
      } else if (rosterData.length > 0) {
        // Default to first active character
        const activeChar = rosterData.find((c) => c.is_active);
        setFeaturedCharacter(activeChar || rosterData[0]);
      }

      // Fetch active episode and its events
      if (showEvents) {
        const episodeData = await getOverlayActiveEpisode(slug);
        setActiveEpisode(episodeData);

        if (episodeData) {
          try {
            const eventsData = await getOverlayEvents(episodeData.id);
            setEvents(eventsData);
          } catch (err) {
            console.warn('Failed to fetch events:', err);
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
      }

      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch overlay data:', err);
      setError(err.message || 'Failed to load overlay data');
    } finally {
      setLoading(false);
    }
  }, [slug, featuredCharacterSlug, showEvents]);

  // Initial load
  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!slug || loading) return;

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [slug, loading, fetchData]);

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-950' : 'bg-gray-100'
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin h-12 w-12 border-4 ${
              darkMode ? 'border-purple-500' : 'border-purple-600'
            } border-t-transparent rounded-full mx-auto`}
          ></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading overlay...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-950' : 'bg-gray-100'
        }`}
      >
        <div className="text-center max-w-md p-6">
          <h1
            className={`text-2xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Overlay Error
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {error || 'Campaign not found'}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Check your URL and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 ${
        darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gray-100'
      }`}
    >
      {/* Campaign Header */}
      <div
        className={`mb-6 text-center ${
          darkMode ? 'bg-gray-900/90' : 'bg-white'
        } backdrop-blur-sm rounded-lg p-4 border-2 ${
          darkMode ? 'border-purple-600' : 'border-purple-500'
        }`}
      >
        <h1
          className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          } mb-2`}
          style={{
            textShadow: darkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {campaign.name}
        </h1>
        {activeEpisode && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {activeEpisode.season && `S${activeEpisode.season} `}
            {activeEpisode.episode_number && `E${activeEpisode.episode_number} - `}
            {activeEpisode.name}
          </p>
        )}
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Featured Character */}
        {showFeatured && featuredCharacter && (
          <div className="lg:col-span-1">
            <OverlayCharacterCard character={featuredCharacter} variant="full" />
          </div>
        )}

        {/* Middle/Right Column - Events and Roster */}
        <div
          className={showFeatured && featuredCharacter ? 'lg:col-span-2' : 'lg:col-span-3'}
        >
          <div className="space-y-4">
            {/* Event Timeline */}
            {showEvents && (
              <OverlayEventTimeline
                events={events}
                characters={characters}
                maxEvents={8}
              />
            )}

            {/* Character Roster */}
            {showRoster && (
              <OverlayRoster
                characters={characters}
                layout={rosterLayout}
                maxCharacters={12}
              />
            )}
          </div>
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4">
        <div
          className={`px-3 py-2 rounded-full ${
            darkMode ? 'bg-gray-900/90' : 'bg-white'
          } backdrop-blur-sm border ${
            darkMode ? 'border-gray-700' : 'border-gray-300'
          } flex items-center gap-2 shadow-lg`}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Live
          </span>
        </div>
      </div>

      {/* Usage Instructions (Hidden in production, visible in dev) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 max-w-xs">
          <details className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700 text-xs">
            <summary className="cursor-pointer text-gray-400 font-semibold mb-2">
              Overlay URL Parameters
            </summary>
            <ul className="text-gray-500 space-y-1 list-disc list-inside">
              <li>
                <code>?roster=false</code> - Hide roster
              </li>
              <li>
                <code>?events=false</code> - Hide events
              </li>
              <li>
                <code>?featured=false</code> - Hide featured character
              </li>
              <li>
                <code>?character=slug</code> - Set featured character
              </li>
              <li>
                <code>?layout=horizontal|vertical|grid</code> - Roster layout
              </li>
              <li>
                <code>?theme=light</code> - Use light mode
              </li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

export default function OverlayPage() {
  return <OverlayPageContent />;
}
