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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-700 dark:border-emerald-500 border-t-transparent rounded-full mx-auto shadow-emerald"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !episode || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
        <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-elevated p-8 border border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Episode Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The episode you are looking for does not exist.'}
          </p>
          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="inline-block px-6 py-3 bg-emerald-700 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-800 dark:hover:bg-emerald-500 transition-all duration-200 font-semibold shadow-emerald hover:shadow-xl hover:-translate-y-0.5"
          >
            Back to Episodes
          </Link>
        </div>
      </div>
    );
  }

  const events = (episode as any).events || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-green-950/20">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-emerald-200 dark:border-emerald-900/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href={`/campaigns/${campaignSlug}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium">
              {campaign.name}
            </Link>
            <span>/</span>
            <Link
              href={`/campaigns/${campaignSlug}/episodes`}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              Episodes
            </Link>
            <span>/</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{episode.name}</span>
          </div>

          <Link
            href={`/campaigns/${campaignSlug}/episodes`}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-semibold flex items-center gap-1 transition-colors"
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
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-bold mb-4 border border-emerald-300 dark:border-emerald-700/50 shadow-sm">
                S{episode.season}E{episode.episode_number}
              </span>
            )}
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent mb-4">{episode.name}</h1>

          {/* Episode Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-700 dark:text-gray-300">
            {episode.air_date && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Air Date:</span>{' '}
                {new Date(episode.air_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
            {episode.runtime && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Runtime:</span> {episode.runtime} minutes
              </div>
            )}
          </div>
        </div>

        {/* Episode Description */}
        {episode.description && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-900/50 p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 rounded-full"></span>
              Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {episode.description}
            </p>
          </div>
        )}

        {/* Events Timeline */}
        {events.length > 0 && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-900/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <span className="h-1 w-8 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 rounded-full"></span>
              Key Events
            </h2>

            <div className="space-y-6">
              {events.map((event: Event, index: number) => (
                <div key={event.id} className="flex gap-6">
                  {/* Timeline marker */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 rounded-full mt-2 shadow-emerald"></div>
                    {index < events.length - 1 && (
                      <div className="w-1 h-16 bg-gradient-to-b from-emerald-300 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 mt-4 rounded-full"></div>
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
                          <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-300 dark:border-emerald-700/50">
                            {event.event_type}
                          </span>
                        )}
                      </div>
                      {event.timestamp_in_episode && (
                        <div className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                          {Math.floor(event.timestamp_in_episode / 60)}:
                          {String(event.timestamp_in_episode % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-emerald-400 dark:text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700 dark:text-gray-300 font-medium">No events recorded for this episode yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 dark:text-gray-400 py-12 mt-12 border-t border-emerald-800/50 dark:border-emerald-900/30">
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
