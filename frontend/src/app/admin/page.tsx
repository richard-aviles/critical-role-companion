/**
 * Admin Dashboard
 * Main hub for managing campaigns
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-950 dark:to-purple-950/20">
      <AdminHeader title="Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30 rounded-xl shadow-elevated p-8 mb-8 border-l-4 border-purple-600 dark:border-purple-500">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            You're logged in and ready to manage your campaigns.
          </p>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="h-1 w-8 bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-500 dark:to-purple-400 rounded-full"></span>
            Your Campaigns
          </h2>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {user.campaigns && user.campaigns.length > 0
                ? `You have ${user.campaigns.length} campaign${user.campaigns.length > 1 ? 's' : ''}`
                : 'No campaigns yet'}
            </p>
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="px-4 py-2 text-sm font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              View All Campaigns
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {user.campaigns && user.campaigns.length > 0 ? (
            <div className="space-y-4">
              {user.campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{campaign.slug}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      className="px-4 py-2 text-sm font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all flex items-center gap-1"
                    >
                      Manage
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-950/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
                You don't have any campaigns yet.
              </p>
              <button
                onClick={() => router.push('/admin/campaigns/new')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 font-semibold shadow-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
