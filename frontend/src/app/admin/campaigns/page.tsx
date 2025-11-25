/**
 * Campaign List Page
 * Display all campaigns owned by the user
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';

function CampaignListContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const campaigns = user.campaigns || [];
  const hasCampaigns = campaigns.length > 0;

  const handleCopyToken = (token: string, campaignId: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(campaignId);
    // Reset after 2 seconds
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader title="Campaigns" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              {hasCampaigns
                ? `You own ${campaigns.length} campaign${campaigns.length > 1 ? 's' : ''}`
                : 'No campaigns yet'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/campaigns/new')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-semibold transition-colors"
          >
            + New Campaign
          </button>
        </div>

        {hasCampaigns ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  {/* Campaign Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {campaign.name}
                  </h3>

                  {/* Campaign Slug */}
                  <p className="text-sm text-gray-500 mb-4">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {campaign.slug}
                    </code>
                  </p>

                  {/* Campaign Token (truncated) */}
                  <div className="bg-gray-50 rounded p-2 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Admin Token</p>
                    <code className="text-xs text-gray-700 break-all">
                      {campaign.admin_token?.substring(0, 20)}...
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleCopyToken(campaign.admin_token, campaign.id)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                        copiedTokenId === campaign.id
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300'
                      }`}
                      title="Copy admin token"
                    >
                      {copiedTokenId === campaign.id ? 'Copied!' : 'Copy Token'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first campaign to get started managing characters,
              episodes, and events.
            </p>
            <button
              onClick={() => router.push('/admin/campaigns/new')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Create Campaign
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CampaignListPage() {
  return (
    <ProtectedRoute>
      <CampaignListContent />
    </ProtectedRoute>
  );
}
