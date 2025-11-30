'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminHeader } from '@/components/AdminHeader';
import { useAuth } from '@/hooks/useAuth';
import { getCharacters, getCampaignLayouts, updateCharacter, Character } from '@/lib/api';

interface StatValue {
  [characterId: string]: {
    [statKey: string]: number | undefined;
  };
}

function QuickStatsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = params?.id as string;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [layout, setLayout] = useState<any>(null);
  const [statValues, setStatValues] = useState<StatValue>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch characters and layouts in parallel
        const [charactersData, layouts] = await Promise.all([
          getCharacters(campaignId),
          getCampaignLayouts(campaignId),
        ]);

        // Get the default layout or the first one
        const layoutData = layouts && layouts.length > 0
          ? (layouts.find((l: any) => l.is_default) || layouts[0])
          : null;

        setCharacters(charactersData);
        setLayout(layoutData);

        // Initialize stat values from character data
        const initialValues: StatValue = {};
        charactersData.forEach((char: Character) => {
          initialValues[char.id] = {};
          // Add HP and AC (always included)
          initialValues[char.id]['hp'] = char.stats?.hp;
          initialValues[char.id]['ac'] = char.stats?.ac;
          // Add other stats from layout config
          layoutData.stats_config?.forEach((stat: any) => {
            initialValues[char.id][stat.key] = char.stats?.[stat.key];
          });
        });
        setStatValues(initialValues);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const handleStatChange = (characterId: string, statKey: string, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    setStatValues((prev) => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        [statKey]: numValue,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);

      // Get admin token from localStorage
      const adminToken = localStorage.getItem(`campaign_${campaignId}_token`) || '';

      // Update each character individually
      const updatePromises = characters.map(async (character) => {
        const characterStats = statValues[character.id];

        // Only update if there are changes
        const hasCharacterChanges = Object.keys(characterStats).some(
          (key) => characterStats[key] !== character.stats?.[key]
        );

        if (hasCharacterChanges) {
          await updateCharacter(
            campaignId,
            character.id,
            { stats: characterStats },
            undefined,
            adminToken
          );
        }
      });

      await Promise.all(updatePromises);

      setHasChanges(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Refresh characters
      const updatedCharacters = await getCharacters(campaignId);
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Error saving stats:', error);
      setError(error instanceof Error ? error.message : 'Error saving stats. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No card layout configured. Please configure the card layout first.
          </p>
        </div>
      </div>
    );
  }

  // Filter out HP and AC from stats_config since we display them separately
  const visibleStats = layout.stats_config?.filter((stat: any) => stat.visible && stat.key !== 'hp' && stat.key !== 'ac') || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow dark:shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Stats</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update character stats for all characters at once
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
                className="px-4 py-2 border border-purple-300 dark:border-purple-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:-translate-y-0.5 transition-all duration-200 font-medium shadow-sm focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
              >
                ← Back to Campaign
              </button>
              <button
                onClick={handleSaveAll}
                disabled={!hasChanges || saving}
                className="px-6 py-2 bg-purple-600 dark:bg-purple-700 text-white font-medium rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="fixed top-20 left-4 right-4 z-50 flex justify-center">
          <div className="max-w-2xl w-full bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500 border border-gray-200 dark:border-gray-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-md shadow-lg">
            All character stats updated successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-20 left-4 right-4 z-50 flex justify-center">
          <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 border border-gray-200 dark:border-gray-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-md shadow-lg">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900"
                  >
                    Character
                  </th>
                  {/* HP and AC columns (always shown) */}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    HP
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    AC
                  </th>
                  {visibleStats.map((stat: any) => (
                    <th
                      key={stat.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {stat.label}
                      {stat.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {characters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleStats.length + 3}
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No characters found. Create some characters first.
                    </td>
                  </tr>
                ) : (
                  characters.map((character) => (
                    <tr key={character.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-semibold">{character.name}</div>
                          {character.player_name && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {character.player_name}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* HP input */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={statValues[character.id]?.['hp'] ?? ''}
                          onChange={(e) =>
                            handleStatChange(character.id, 'hp', e.target.value)
                          }
                          placeholder="—"
                          className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                        />
                      </td>
                      {/* AC input */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={statValues[character.id]?.['ac'] ?? ''}
                          onChange={(e) =>
                            handleStatChange(character.id, 'ac', e.target.value)
                          }
                          placeholder="—"
                          className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                        />
                      </td>
                      {visibleStats.map((stat: any) => (
                        <td key={stat.key} className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={statValues[character.id]?.[stat.key] ?? ''}
                            onChange={(e) =>
                              handleStatChange(character.id, stat.key, e.target.value)
                            }
                            placeholder="—"
                            className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-purple-700 dark:text-purple-400">Tip:</strong> Stats marked with <span className="text-red-500 dark:text-red-400">*</span> are
            required stats. Empty fields will default to 0.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QuickStatsPage() {
  return (
    <ProtectedRoute>
      <QuickStatsContent />
    </ProtectedRoute>
  );
}
