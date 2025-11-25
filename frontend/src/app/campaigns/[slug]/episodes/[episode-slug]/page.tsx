/**
 * Public Episode Detail Page
 * Displays episode information with events timeline
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicEpisode, getPublicCampaign, Event } from '@/lib/api';

function EpisodeDetailPageContent() {
  const params = useParams<{ slug: string; 'episode-slug': string }>();
  const [episode, setEpisode] = useState<any | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignSlug = params.slug;
  const episodeSlug = params['episode-slug'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [episodeData, campaignData] = await Promise.all([
          getPublicEpisode(campaignSlug, episodeSlug),
          getPublicCampaign(campaignSlug),
        ]);

        setEpisode(episodeData);
        setCampaign(campaignData);
      } catch (err: any) {
        setError(err.message || 'Failed to load episode');
      } finally {
        setLoading(false);
      }
    };

    if (campaignSlug && episodeSlug) {
      fetchData();
    }
  }, [campaignSlug, episodeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !episode || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Episode Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The episode you are looking for does not exist.'}
          </p>
          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-semibold"
          >
            Back to Episodes
          </Link>
        </div>
      </div>
    );
  }

  const events = (episode as any).events || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${campaignSlug}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {campaign.name}
            </Link>
            <span>/</span>
            <Link
              href={`/campaigns/${campaignSlug}/episodes`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Episodes
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{episode.name}</span>
          </div>

          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            ← Back to Episode Guide
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Episode Header */}
        <div className="mb-12">
          <div className="mb-4">
            {episode.season && episode.episode_number && (
              <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold mb-4">
                S{episode.season}E{episode.episode_number}
              </span>
            )}
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{episode.name}</h1>

          {/* Episode Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
            {episode.air_date && (
              <div>
                <span className="font-semibold">Air Date:</span>{' '}
                {new Date(episode.air_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
            {episode.runtime && (
              <div>
                <span className="font-semibold">Runtime:</span> {episode.runtime} minutes
              </div>
            )}
          </div>
        </div>

        {/* Episode Description */}
        {episode.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {episode.description}
            </p>
          </div>
        )}

        {/* Events Timeline */}
        {events.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Key Events</h2>

            <div className="space-y-6">
              {events.map((event: Event, index: number) => (
                <div key={event.id} className="flex gap-6">
                  {/* Timeline marker */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-full mt-2"></div>
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-4"></div>
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {event.name}
                        </h3>
                        {event.event_type && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                            {event.event_type}
                          </span>
                        )}
                      </div>
                      {event.timestamp_in_episode && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {Math.floor(event.timestamp_in_episode / 60)}:
                          {String(event.timestamp_in_episode % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-600 dark:text-gray-400">
            No events recorded for this episode yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function EpisodeDetailPage() {
  return <EpisodeDetailPageContent />;
}
