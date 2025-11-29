'use client';

import { useState, useRef, useEffect } from 'react';

interface Stat {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  required?: boolean;
}

interface Badge {
  stat: string;
  x: number;
  y: number;
  size?: number;
  rotation?: number;
  shape?: string;
}

interface BadgePositioningEditorProps {
  stats: Stat[];
  badges: Badge[];
  onChange: (badges: Badge[]) => void;
}

const GRID_SIZE = 2; // 2px grid for smooth, precise movement
const SNAP_DISTANCE = 4; // Snap within 4px

export default function BadgePositioningEditor({
  stats,
  badges,
  onChange,
}: BadgePositioningEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingBadge, setDraggingBadge] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [alignmentLines, setAlignmentLines] = useState<{
    vertical?: number;
    horizontal?: number;
  }>({});

  const snap = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, badgeStat: string) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const badge = badges.find((b) => b.stat === badgeStat);
    if (!badge) return;

    setDraggingBadge(badgeStat);
    setDragOffset({
      x: e.clientX - rect.left - (badge.x / 100) * rect.width,
      y: e.clientY - rect.top - (badge.y / 100) * rect.height,
    });
  };

  useEffect(() => {
    if (!draggingBadge || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      let x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      let y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

      // Clamp to canvas
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      // Check for alignment with other badges
      let lines: { vertical?: number; horizontal?: number } = {};
      badges.forEach((badge) => {
        if (badge.stat === draggingBadge) return;

        if (Math.abs(x - badge.x) < SNAP_DISTANCE) {
          x = badge.x;
          lines.vertical = x;
        }
        if (Math.abs(y - badge.y) < SNAP_DISTANCE) {
          y = badge.y;
          lines.horizontal = y;
        }
      });

      setAlignmentLines(lines);

      const snappedX = snap(x);
      const snappedY = snap(y);

      const updatedBadges = badges.map((b) =>
        b.stat === draggingBadge ? { ...b, x: snappedX, y: snappedY } : b
      );
      onChange(updatedBadges);
    };

    const handleMouseUp = () => {
      setDraggingBadge(null);
      setAlignmentLines({});
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingBadge, dragOffset, badges, onChange]);

  const handleAddBadge = (stat: Stat) => {
    if (badges.some((b) => b.stat === stat.key)) return;

    onChange([
      ...badges,
      {
        stat: stat.key,
        x: 50,
        y: 50,
        size: 1.0,
        shape: 'hexagon',
      },
    ]);
  };

  const handleRemoveBadge = (stat: string) => {
    onChange(badges.filter((b) => b.stat !== stat));
  };

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Drag badges to position them
        </label>

        <div
          ref={canvasRef}
          className="relative w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          style={{ paddingBottom: '50%' }}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(200,200,200,.05) 25%, rgba(200,200,200,.05) 26%, transparent 27%, transparent 74%, rgba(200,200,200,.05) 75%, rgba(200,200,200,.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(200,200,200,.05) 25%, rgba(200,200,200,.05) 26%, transparent 27%, transparent 74%, rgba(200,200,200,.05) 75%, rgba(200,200,200,.05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '${GRID_SIZE * 4}px ${GRID_SIZE * 4}px',
            }}
          />

          {/* Alignment Lines */}
          {alignmentLines.vertical !== undefined && (
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400 pointer-events-none"
              style={{
                left: `${alignmentLines.vertical}%`,
              }}
            />
          )}
          {alignmentLines.horizontal !== undefined && (
            <div
              className="absolute left-0 right-0 h-px bg-red-400 pointer-events-none"
              style={{
                top: `${alignmentLines.horizontal}%`,
              }}
            />
          )}

          {/* Badges */}
          {badges.map((badge) => (
            <div
              key={badge.stat}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
                draggingBadge === badge.stat ? 'scale-125 shadow-xl' : ''
              }`}
              style={{
                left: `${badge.x}%`,
                top: `${badge.y}%`,
                backgroundColor: '#3b82f6',
              }}
              onMouseDown={(e) => handleMouseDown(e, badge.stat)}
            >
              {badge.stat[0].toUpperCase()}
            </div>
          ))}

          {badges.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Add badges to position them
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          2px grid precision. Badges automatically align with others within 4px.
        </div>
      </div>

      {/* Add Badges */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Badges</h3>

        <div className="grid grid-cols-3 gap-2">
          {stats
            .filter((stat) => !stat.required) // Filter out required stats (HP, AC)
            .map((stat) => (
            <button
              key={stat.key}
              onClick={() => handleAddBadge(stat)}
              disabled={badges.some((b) => b.stat === stat.key)}
              className="px-3 py-2 text-sm font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:border-gray-200 dark:disabled:border-gray-700"
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge List */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Active Badges</h3>

        <div className="space-y-2">
          {badges
            .filter((badge) => {
              const stat = stats.find((s) => s.key === badge.stat);
              return !stat?.required; // Filter out required stats (HP, AC)
            })
            .map((badge) => (
            <div key={badge.stat} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-md">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {stats.find((s) => s.key === badge.stat)?.label || badge.stat}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Position: {badge.x.toFixed(0)}%, {badge.y.toFixed(0)}%
                </div>
              </div>

              <button
                onClick={() => handleRemoveBadge(badge.stat)}
                className="px-3 py-1 text-xs bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {badges.filter((badge) => {
          const stat = stats.find((s) => s.key === badge.stat);
          return !stat?.required;
        }).length === 0 && (
          <p className="text-sm text-gray-600">No badges added yet</p>
        )}
      </div>
    </div>
  );
}
