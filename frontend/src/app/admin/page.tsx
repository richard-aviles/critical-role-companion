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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            You're logged in and ready to manage your campaigns.
          </p>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Campaigns</h2>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700">
              {user.campaigns && user.campaigns.length > 0
                ? `You have ${user.campaigns.length} campaign${user.campaigns.length > 1 ? 's' : ''}`
                : 'No campaigns yet'}
            </p>
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All Campaigns →
            </button>
          </div>

          {user.campaigns && user.campaigns.length > 0 ? (
            <div className="space-y-4">
              {user.campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-500">{campaign.slug}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
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
