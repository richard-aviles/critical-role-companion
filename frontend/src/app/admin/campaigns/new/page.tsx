/**
 * Create Campaign Page
 * Form to create a new campaign
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/lib/api';
import { CampaignForm } from '@/components/CampaignForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { saveCampaigns } from '@/lib/auth';

function CreateCampaignContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCampaign({
        slug: data.slug,
        name: data.name,
        description: data.description,
      });

      // Update campaigns list in localStorage with full campaign data
      if (user) {
        const newCampaign = {
          id: result.id,
          slug: result.slug,
          name: result.name,
          description: result.description || '',
          admin_token: result.admin_token,
          created_at: result.created_at,
          updated_at: result.updated_at,
        };

        const updatedCampaigns = [
          ...(user.campaigns || []),
          newCampaign,
        ];
        saveCampaigns(updatedCampaigns);
      }

      // Redirect to campaign detail
      router.push(`/admin/campaigns/${result.id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Failed to create campaign. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/campaigns');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Create Campaign" />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <CampaignForm
            mode="create"
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  );
}

export default function CreateCampaignPage() {
  return (
    <ProtectedRoute>
      <CreateCampaignContent />
    </ProtectedRoute>
  );
}
