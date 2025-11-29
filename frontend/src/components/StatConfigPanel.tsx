'use client';

import { useState } from 'react';

interface Stat {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  required?: boolean;
}

interface StatConfigPanelProps {
  stats: Stat[];
  onChange: (stats: Stat[]) => void;
}

export default function StatConfigPanel({ stats, onChange }: StatConfigPanelProps) {
  const [newStatKey, setNewStatKey] = useState('');
  const [newStatLabel, setNewStatLabel] = useState('');

  const handleToggleVisibility = (key: string) => {
    onChange(
      stats.map((stat) =>
        stat.key === key ? { ...stat, visible: !stat.visible } : stat
      )
    );
  };

  const handleRenameLabel = (key: string, newLabel: string) => {
    onChange(
      stats.map((stat) =>
        stat.key === key ? { ...stat, label: newLabel } : stat
      )
    );
  };

  const handleRemoveStat = (key: string) => {
    onChange(stats.filter((stat) => stat.key !== key));
  };

  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatKey.trim() || !newStatLabel.trim()) return;

    const maxOrder = stats.length > 0 ? Math.max(...stats.map(s => s.order)) + 1 : 0;

    onChange([
      ...stats,
      {
        key: newStatKey.toLowerCase().replace(/\s+/g, '_'),
        label: newStatLabel.toUpperCase(),
        visible: true,
        order: maxOrder,
      },
    ]);

    setNewStatKey('');
    setNewStatLabel('');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStats = [...stats];
    [newStats[index - 1].order, newStats[index].order] = [newStats[index].order, newStats[index - 1].order];
    const sorted = newStats.sort((a, b) => a.order - b.order);
    onChange(sorted);
  };

  const handleMoveDown = (index: number) => {
    if (index === stats.length - 1) return;
    const newStats = [...stats];
    [newStats[index].order, newStats[index + 1].order] = [newStats[index + 1].order, newStats[index].order];
    const sorted = newStats.sort((a, b) => a.order - b.order);
    onChange(sorted);
  };

  const sortedStats = [...stats].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Current Stats</h3>
        <div className="space-y-2">
          {sortedStats.map((stat, index) => (
            <div key={stat.key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-md">
              <input
                type="checkbox"
                checked={stat.visible}
                onChange={() => handleToggleVisibility(stat.key)}
                disabled={stat.required}
                className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                title={stat.required ? 'This stat is required and cannot be hidden' : ''}
              />

              <input
                type="text"
                value={stat.label}
                onChange={(e) => handleRenameLabel(stat.key, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />

              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sortedStats.length - 1}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
              </div>

              {!stat.required && (
                <button
                  onClick={() => handleRemoveStat(stat.key)}
                  className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Stat */}
      {stats.length < 8 && (
        <form onSubmit={handleAddStat} className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-md border border-purple-200 dark:border-purple-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Custom Stat</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStatKey}
              onChange={(e) => setNewStatKey(e.target.value)}
              placeholder="Key (e.g., hp, ac)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="text"
              value={newStatLabel}
              onChange={(e) => setNewStatLabel(e.target.value)}
              placeholder="Label (e.g., HP, AC)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white text-sm font-medium rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            You can add up to {8 - stats.length} more custom stats
          </div>
        </form>
      )}
    </div>
  );
}
