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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
      <AdminHeader title="Campaigns" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
              {hasCampaigns
                ? `You own ${campaigns.length} campaign${campaigns.length > 1 ? 's' : ''}`
                : 'No campaigns yet'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/campaigns/new')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-bold transition-all duration-200 shadow-primary hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Campaign
          </button>
        </div>

        {hasCampaigns ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 border border-gray-200 dark:border-gray-800"
              >
                <div className="p-6">
                  {/* Campaign Name */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {campaign.name}
                  </h3>

                  {/* Campaign Slug */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-mono">
                      {campaign.slug}
                    </code>
                  </p>

                  {/* Campaign Token (truncated) */}
                  <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-950/30 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">Admin Token</p>
                    <code className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono">
                      {campaign.admin_token?.substring(0, 20)}...
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleCopyToken(campaign.admin_token, campaign.id)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                        copiedTokenId === campaign.id
                          ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70 border border-purple-300 dark:border-purple-700'
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
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 rounded-xl shadow-elevated p-12 text-center border border-gray-700 dark:border-gray-800">
            <svg className="mx-auto h-20 w-20 text-purple-400 dark:text-purple-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-2xl font-bold text-white dark:text-white mb-3">
              No campaigns yet
            </h3>
            <p className="text-gray-300 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Create your first campaign to get started managing characters,
              episodes, and events.
            </p>
            <button
              onClick={() => router.push('/admin/campaigns/new')}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-bold transition-all duration-200 shadow-primary hover:shadow-xl hover:-translate-y-0.5"
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
