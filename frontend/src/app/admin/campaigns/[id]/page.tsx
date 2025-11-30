/**
 * Campaign Detail Page
 * View, edit, and delete a campaign
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCampaignDetail, updateCampaign, deleteCampaign } from '@/lib/api';
import { CampaignForm } from '@/components/CampaignForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { getCampaigns, saveCampaigns } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

interface Campaign {
  id: string;
  slug: string;
  name: string;
  description?: string;
  admin_token?: string;
  created_at: string;
  updated_at: string;
}

function CampaignDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch campaign on mount
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);

        // First, try to find campaign in localStorage (for recently created campaigns)
        const localCampaigns = getCampaigns();
        const localCampaign = localCampaigns.find((c: any) => c.id === campaignId);

        if (localCampaign) {
          // Use local data immediately (freshly created campaign)
          const campaignData: Campaign = {
            id: localCampaign.id,
            slug: localCampaign.slug,
            name: localCampaign.name,
            description: localCampaign.description || '',
            admin_token: localCampaign.admin_token,
            created_at: localCampaign.created_at || new Date().toISOString(),
            updated_at: localCampaign.updated_at || new Date().toISOString(),
          };
          setCampaign(campaignData);
          // Save token to localStorage for admin operations (card layout, etc)
          if (localCampaign.admin_token) {
            localStorage.setItem(`campaign_${localCampaign.id}_token`, localCampaign.admin_token);
          }
          setError(null);
          setIsLoading(false);

          // Then fetch fresh data from server in the background
          try {
            const data = await getCampaignDetail(campaignId);
            setCampaign(data);
            // Update token in localStorage from server data
            if (data.admin_token) {
              localStorage.setItem(`campaign_${campaignId}_token`, data.admin_token);
            }
          } catch (err) {
            // If fetch fails, we already have the local data, so continue silently
            console.log('Background fetch failed, using local data');
          }
          return;
        }

        // If not in localStorage, fetch from server
        const data = await getCampaignDetail(campaignId);
        setCampaign(data);
        // Save token to localStorage for admin operations (card layout, etc)
        if (data.admin_token) {
          localStorage.setItem(`campaign_${campaignId}_token`, data.admin_token);
        }
        setError(null);
      } catch (err: any) {
        const status = err.response?.status;
        const errorMessage =
          err.response?.data?.detail || 'Failed to load campaign';

        // Handle 404 - campaign doesn't exist on server
        if (status === 404) {
          setError(null);
          setCampaign(null); // This will trigger the "not found" UI
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const handleUpdate = async (data: any) => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateCampaign(campaignId, {
        name: data.name,
        description: data.description,
      });

      // Update local state with fresh campaign data
      setCampaign(result);

      // Save token to localStorage for admin operations
      if (result.admin_token) {
        localStorage.setItem(`campaign_${campaignId}_token`, result.admin_token);
      }

      // Update localStorage with updated campaign
      if (user && user.campaigns) {
        const updatedCampaigns = user.campaigns.map((c: any) =>
          c.id === campaignId
            ? {
                ...c,
                name: result.name,
                description: result.description,
                updated_at: result.updated_at,
                admin_token: result.admin_token || c.admin_token,
              }
            : c
        );
        saveCampaigns(updatedCampaigns);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to update campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteCampaign(campaignId);

      // Remove campaign from localStorage
      if (user && user.campaigns) {
        const updatedCampaigns = user.campaigns.filter(
          (c: any) => c.id !== campaignId
        );
        saveCampaigns(updatedCampaigns);
      }

      // Redirect to campaigns list
      router.push('/admin/campaigns');
    } catch (err: any) {
      const status = err.response?.status;

      // If campaign doesn't exist on server (already deleted), remove from localStorage and redirect
      if (status === 404) {
        if (user && user.campaigns) {
          const updatedCampaigns = user.campaigns.filter(
            (c: any) => c.id !== campaignId
          );
          saveCampaigns(updatedCampaigns);
        }
        // Redirect to campaigns list
        router.push('/admin/campaigns');
        return;
      }

      const errorMessage =
        err.response?.data?.detail || 'Failed to delete campaign';
      setError(errorMessage);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    // Check if this campaign exists in localStorage
    const localCampaigns = getCampaigns();
    const localCampaign = localCampaigns.find((c: any) => c.id === campaignId);

    const handleRemoveFromList = () => {
      // Remove this campaign from localStorage
      if (user && user.campaigns) {
        const updatedCampaigns = user.campaigns.filter(
          (c: any) => c.id !== campaignId
        );
        saveCampaigns(updatedCampaigns);
      }
      // Redirect to campaigns list
      router.push('/admin/campaigns');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Campaign Not Found</h1>
          {localCampaign ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This campaign was deleted on the server, but it's still showing in your list.
                Would you like to remove it from your campaigns?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRemoveFromList}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg font-semibold"
                >
                  Remove from List
                </button>
                <button
                  onClick={() => router.push('/admin/campaigns')}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Back
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">The campaign you're looking for doesn't exist.</p>
              <button
                onClick={() => router.push('/admin/campaigns')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg font-semibold"
              >
                Back to Campaigns
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(campaign?.admin_token || '');
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <AdminHeader title={campaign?.name} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-purple-200 dark:border-purple-800/40">
          <div className="flex gap-8">
            <button className="px-4 py-3 border-b-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 font-medium transition-all duration-200">
              Details
            </button>
            <a href={`/admin/campaigns/${campaign.id}/characters`} className="px-4 py-3 border-b-2 border-transparent text-gray-600 dark:text-gray-300 font-medium hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              Characters
            </a>
            <a href={`/admin/campaigns/${campaign.id}/episodes`} className="px-4 py-3 border-b-2 border-transparent text-gray-600 dark:text-gray-300 font-medium hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              Episodes
            </a>
            <a href={`/admin/campaigns/${campaign.id}/card-layout`} className="px-4 py-3 border-b-2 border-transparent text-gray-600 dark:text-gray-300 font-medium hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              Card Layout
            </a>
            <a href={`/admin/campaigns/${campaign.id}/quick-stats`} className="px-4 py-3 border-b-2 border-transparent text-gray-600 dark:text-gray-300 font-medium hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
              Quick Stats
            </a>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 p-6 transition-all duration-200">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Campaign Details
              </h2>
              <CampaignForm
                mode="edit"
                initialData={{
                  id: campaign.id,
                  slug: campaign.slug,
                  name: campaign.name,
                  description: campaign.description,
                }}
                isLoading={isUpdating}
                error={error}
                onSubmit={handleUpdate}
                onCancel={() => router.push('/admin/campaigns')}
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Admin Token */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 p-6 transition-all duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Admin Token</h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3 mb-3 border border-purple-200 dark:border-purple-800/40">
                <code className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono">
                  {campaign.admin_token}
                </code>
              </div>
              <button
                onClick={handleCopyToken}
                className={`w-full px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  copiedToken
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 hover:-translate-y-0.5 border border-purple-300 dark:border-purple-700 shadow-lg'
                }`}
              >
                {copiedToken ? 'Copied!' : 'Copy Token'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Use this token for any admin operations on this campaign
              </p>
            </div>

            {/* Campaign Info */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-elevated dark:shadow-elevated border border-purple-100 dark:border-purple-900/30 p-6 transition-all duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Info</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Created</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Updated</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/50 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-lg p-6 shadow-lg transition-all duration-200">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Deleting a campaign cannot be undone. All associated data will be lost.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold shadow-lg"
              >
                Delete Campaign
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        title="Delete Campaign?"
        message={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        itemName={campaign.name}
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <ProtectedRoute>
      <CampaignDetailContent />
    </ProtectedRoute>
  );
}
