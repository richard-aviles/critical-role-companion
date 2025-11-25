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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader title="Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6 mb-8 border-l-4 border-purple-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You're logged in and ready to manage your campaigns.
          </p>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Campaigns</h2>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              {user.campaigns && user.campaigns.length > 0
                ? `You have ${user.campaigns.length} campaign${user.campaigns.length > 1 ? 's' : ''}`
                : 'No campaigns yet'}
            </p>
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="px-4 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              View All Campaigns →
            </button>
          </div>

          {user.campaigns && user.campaigns.length > 0 ? (
            <div className="space-y-4">
              {user.campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.slug}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You don't have any campaigns yet.
              </p>
              <button
                onClick={() => router.push('/admin/campaigns/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
