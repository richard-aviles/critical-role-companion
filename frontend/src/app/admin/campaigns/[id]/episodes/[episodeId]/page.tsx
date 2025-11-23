/**
 * Episode Detail Page
 * View, edit, and manage episode with events
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getEpisode,
  updateEpisode,
  deleteEpisode,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getCharacters,
  Episode,
  Event,
  Character,
  UpdateEpisodeData,
  CreateEventData,
  UpdateEventData,
  setAuthToken,
} from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';
import { EpisodeForm } from '@/components/EpisodeForm';
import { EventTimeline } from '@/components/EventTimeline';
import { EventForm } from '@/components/EventForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function EpisodeDetailPageContent() {
  const params = useParams<{ id: string; episodeId: string }>();
  const router = useRouter();
  const { user, campaigns } = useAuth();

  const campaignId = params.id;
  const episodeId = params.episodeId;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormLoading, setEventFormLoading] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Get campaign admin token on mount
  useEffect(() => {
    // Find the campaign's admin_token from the campaigns list
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setAdminToken(campaign.admin_token);
      setAuthToken(campaign.admin_token);
    }
  }, [campaignId, campaigns]);

  // Fetch episode, events, and characters on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!episodeId || !campaignId) return;

      // Wait for campaign to be loaded so auth token is set
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch episode, events, and characters in parallel
        const [episodeData, eventsData, charactersData] = await Promise.all([
          getEpisode(campaignId, episodeId),
          getEvents(episodeId, campaign.admin_token || undefined),
          getCharacters(campaignId),
        ]);

        setEpisode(episodeData);
        setEvents(eventsData);
        setCharacters(charactersData);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 404) {
          setError('Episode not found. It may have been deleted.');
        } else if (status === 403) {
          setError('You do not have permission to view this episode.');
        } else {
          setError(err.message || 'Failed to load episode. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [episodeId, campaignId, campaigns]);

  // Handle episode update
  const handleUpdateEpisode = async (data: UpdateEpisodeData) => {
    if (!episodeId) return;

    setIsUpdating(true);
    setError(null);

    try {
      const updatedEpisode = await updateEpisode(campaignId, episodeId, data, adminToken || undefined);
      setEpisode(updatedEpisode);
      setIsEditing(false);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 403) {
        setError('You do not have permission to edit this episode.');
      } else if (status === 404) {
        setError('Episode not found. It may have been deleted.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to update episode');
      }
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle episode delete
  const handleDeleteEpisode = async () => {
    if (!episodeId) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteEpisode(campaignId, episodeId, adminToken || undefined);
      // Redirect to episodes list
      router.push(`/admin/campaigns/${campaignId}/episodes`);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 404) {
        // Episode doesn't exist, redirect anyway
        router.push(`/admin/campaigns/${campaignId}/episodes`);
        return;
      } else if (status === 403) {
        setError('You do not have permission to delete this episode.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to delete episode');
      }
      setIsDeleting(false);
    }
  };

  // Handle event create or update
  const handleEventSubmit = async (data: CreateEventData | UpdateEventData) => {
    if (!episodeId) return;

    setEventFormLoading(true);

    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await updateEvent(episodeId, editingEvent.id, data as UpdateEventData, adminToken || undefined);
        setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
        setEditingEvent(null);
      } else {
        // Create new event
        const newEvent = await createEvent(episodeId, data as CreateEventData, adminToken || undefined);
        setEvents([...events, newEvent]);
        setShowEventForm(false);
      }
    } catch (err: any) {
      setEventFormLoading(false);
      throw err;
    } finally {
      setEventFormLoading(false);
    }
  };

  // Handle event delete
  const handleDeleteEvent = async (eventId: string) => {
    if (!episodeId) return;

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(episodeId, eventId, adminToken || undefined);
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete event';
      alert(errorMessage);
    }
  };

  // Handle edit event
  const handleEditEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setShowEventForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error' : 'Episode Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error || 'The episode you are looking for does not exist.'}
          </p>
          <Link
            href={`/admin/campaigns/${campaignId}/episodes`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Back to Episodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title={episode.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Episode Details Section */}
        <div className="mb-8 bg-white rounded-lg shadow">
          {/* Episode Info Header */}
          {!isEditing && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">{episode.name}</h1>
                    {episode.season && episode.episode_number && (
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        S{episode.season}E{episode.episode_number}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded ${
                        episode.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {episode.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {episode.description && (
                    <p className="text-gray-700 mb-4">{episode.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {episode.air_date && (
                      <div>
                        <span className="text-gray-600">Air Date:</span>{' '}
                        <span className="text-gray-900 font-medium">
                          {new Date(episode.air_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {episode.runtime && (
                      <div>
                        <span className="text-gray-600">Runtime:</span>{' '}
                        <span className="text-gray-900 font-medium">{episode.runtime} minutes</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Slug:</span>{' '}
                      <span className="text-gray-900 font-mono text-xs">{episode.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Link
                    href={`/admin/campaigns/${campaignId}/episodes`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back to Episodes
                  </Link>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Episode</h2>
              <EpisodeForm
                mode="edit"
                initialData={episode}
                onSubmit={handleUpdateEpisode}
                onCancel={() => setIsEditing(false)}
                isLoading={isUpdating}
              />
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          {/* Show Event Form (Create or Edit) */}
          {(showEventForm || editingEvent) && (
            <div className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <EventForm
                mode={editingEvent ? 'edit' : 'create'}
                episodeId={episodeId}
                initialData={editingEvent || undefined}
                availableCharacters={characters}
                onSubmit={handleEventSubmit}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                isLoading={eventFormLoading}
              />
            </div>
          )}

          {/* Event Timeline */}
          {!showEventForm && !editingEvent && (
            <EventTimeline
              events={events}
              episodeId={episodeId}
              onAddEvent={() => setShowEventForm(true)}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Deleting an episode cannot be undone. All events associated with this episode will also be
            deleted.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Episode
          </button>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        title="Delete Episode?"
        message={`Are you sure you want to delete "${episode.name}"? This will also delete all events associated with this episode. This action cannot be undone.`}
        itemName={episode.name}
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        onConfirm={handleDeleteEpisode}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default function EpisodeDetailPage() {
  return (
    <ProtectedRoute>
      <EpisodeDetailPageContent />
    </ProtectedRoute>
  );
}
