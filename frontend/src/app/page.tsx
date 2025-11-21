'use client';

import { useEffect, useState } from 'react';
import { healthCheck, getVersion } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [version, setVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        const healthData = await healthCheck();
        const versionData = await getVersion();

        setHealth(healthData);
        setVersion(versionData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend');
        setHealth(null);
        setVersion(null);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md rounded-lg border border-gray-300 p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold">Critical Role Companion</h1>

        {loading && <p className="text-gray-500">Testing backend connection...</p>}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
            <p className="text-sm text-red-700 mt-2">
              Make sure the backend is running on port 8001
            </p>
          </div>
        )}

        {health && !error && (
          <div className="space-y-4">
            <div className="rounded-md border border-green-300 bg-green-50 p-4">
              <p className="text-green-800">
                ✅ <strong>Backend Connected!</strong>
              </p>
            </div>

            <div className="rounded-md bg-gray-50 p-4">
              <h2 className="font-semibold mb-2">API Status</h2>
              <p className="text-sm text-gray-600">
                Health: <strong>{health.ok ? 'OK' : 'Error'}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Version: <strong>{health.version}</strong>
              </p>
            </div>

            <div className="rounded-md bg-gray-50 p-4">
              <h2 className="font-semibold mb-2">Backend Info</h2>
              <p className="text-sm text-gray-600">
                Environment: <strong>{version.env}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Timestamp: <strong>{new Date(version.timestamp).toLocaleString()}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}