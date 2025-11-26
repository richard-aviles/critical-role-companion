'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCampaignLayouts, createCharacterLayout, updateCharacterLayout } from '@/lib/api';
import CardTypeToggle from '@/components/CardTypeToggle';
import StatConfigPanel from '@/components/StatConfigPanel';
import BadgePositioningEditor from '@/components/BadgePositioningEditor';
import CardPreview from '@/components/CardPreview';
import ColorThemeSelector from '@/components/ColorThemeSelector';
import ImageSettingsPanel from '@/components/ImageSettingsPanel';

interface Stat {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

interface Badge {
  stat: string;
  x: number;
  y: number;
  size?: number;
  rotation?: number;
  shape?: string;
}

interface Layout {
  id?: string;
  campaign_id: string;
  name: string;
  is_default: boolean;
  card_type: 'simple' | 'enhanced';
  stats_config: Stat[];
  stats_to_display: string[];
  image_width_percent: number;
  image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  background_image_url?: string;
  border_colors: string[];
  text_color: string;
  badge_interior_gradient: Record<string, any>;
  hp_color: Record<string, any>;
  ac_color: Record<string, any>;
  badge_layout: Badge[];
  border_color_count: number;
  color_preset?: string;
}

const DEFAULT_STATS: Stat[] = [
  { key: 'str', label: 'STR', visible: true, order: 0 },
  { key: 'dex', label: 'DEX', visible: true, order: 1 },
  { key: 'con', label: 'CON', visible: true, order: 2 },
  { key: 'int', label: 'INT', visible: true, order: 3 },
  { key: 'wis', label: 'WIS', visible: true, order: 4 },
  { key: 'cha', label: 'CHA', visible: true, order: 5 },
];

const DEFAULT_GOLD_THEME = {
  border_colors: ['#FFD700', '#FFA500', '#FF8C00', '#DC7F2E'],
  text_color: '#FFFFFF',
  badge_interior_gradient: {
    type: 'radial',
    colors: ['#FFE4B5', '#DAA520'],
  },
  hp_color: {
    border: '#FF0000',
    interior_gradient: {
      type: 'radial',
      colors: ['#FF6B6B', '#CC0000'],
    },
  },
  ac_color: {
    border: '#808080',
    interior_gradient: {
      type: 'radial',
      colors: ['#A9A9A9', '#696969'],
    },
  },
};

export default function CardLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [layout, setLayout] = useState<Layout>({
    campaign_id: campaignId,
    name: 'Default Layout',
    is_default: true,
    card_type: 'simple',
    stats_config: DEFAULT_STATS,
    stats_to_display: DEFAULT_STATS.map(s => s.key),
    image_width_percent: 30,
    image_aspect_ratio: 'square',
    background_image_url: undefined,
    border_colors: DEFAULT_GOLD_THEME.border_colors,
    text_color: DEFAULT_GOLD_THEME.text_color,
    badge_interior_gradient: DEFAULT_GOLD_THEME.badge_interior_gradient,
    hp_color: DEFAULT_GOLD_THEME.hp_color,
    ac_color: DEFAULT_GOLD_THEME.ac_color,
    badge_layout: [],
    border_color_count: 4,
    color_preset: 'option_a',
  });

  const [existingLayout, setExistingLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing layout on mount
  useEffect(() => {
    async function loadLayout() {
      try {
        const token = localStorage.getItem(`campaign_${campaignId}_token`);
        if (!token) {
          // No token found - this is expected on first visit
          // User can still create a new layout, just won't be able to save
          setError('Please go to the campaign admin page first to enable saving.');
          setLoading(false);
          return;
        }

        const layouts = await getCampaignLayouts(campaignId);
        if (layouts && layouts.length > 0) {
          // Load the default layout or the first one
          const defaultLayout = layouts.find((l: any) => l.is_default) || layouts[0];
          setLayout(defaultLayout);
          setExistingLayout(defaultLayout);
        }
      } catch (err: any) {
        console.error('Error loading layout:', err);
        const errorMsg = err.message || 'Failed to load layout';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadLayout();
  }, [campaignId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the campaign token from localStorage
      const token = localStorage.getItem(`campaign_${campaignId}_token`);
      if (!token) {
        setError('Campaign token not found. Please go back and re-enter admin mode.');
        setSaving(false);
        return;
      }

      if (existingLayout?.id) {
        // Update existing layout
        await updateCharacterLayout(campaignId, existingLayout.id, layout);
      } else {
        // Create new layout
        const newLayout = await createCharacterLayout(campaignId, layout);
        setExistingLayout(newLayout);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving layout:', err);
      setError(err instanceof Error ? err.message : 'Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading layout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href={`/admin/campaigns/${campaignId}`}
                className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
              >
                ← Back to Campaign
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Character Card Layout</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            Layout saved successfully!
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Style</h2>
              <CardTypeToggle
                cardType={layout.card_type}
                onChange={(type) => setLayout({ ...layout, card_type: type })}
              />
            </div>

            {/* Stats Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Character Stats</h2>
              <StatConfigPanel
                stats={layout.stats_config}
                onChange={(stats) =>
                  setLayout({
                    ...layout,
                    stats_config: stats,
                    stats_to_display: stats.filter(s => s.visible).map(s => s.key),
                  })
                }
              />
            </div>

            {/* Image Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Image Settings</h2>
              <ImageSettingsPanel
                widthPercent={layout.image_width_percent}
                aspectRatio={layout.image_aspect_ratio}
                backgroundImageUrl={layout.background_image_url}
                onWidthChange={(width) => setLayout({ ...layout, image_width_percent: width })}
                onAspectRatioChange={(ratio) =>
                  setLayout({ ...layout, image_aspect_ratio: ratio })
                }
                onBackgroundImageChange={(url) =>
                  setLayout({ ...layout, background_image_url: url })
                }
              />
            </div>

            {/* Color Theme */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Color Theme</h2>
              <ColorThemeSelector
                borderColors={layout.border_colors}
                textColor={layout.text_color}
                badgeInteriorGradient={layout.badge_interior_gradient}
                hpColor={layout.hp_color}
                acColor={layout.ac_color}
                colorPreset={layout.color_preset}
                onColorPresetChange={(preset, colors) => {
                  setLayout({
                    ...layout,
                    ...colors,
                    color_preset: preset,
                  });
                }}
                onBorderColorsChange={(colors) =>
                  setLayout({ ...layout, border_colors: colors })
                }
                onTextColorChange={(color) => setLayout({ ...layout, text_color: color })}
                onBadgeGradientChange={(gradient) =>
                  setLayout({ ...layout, badge_interior_gradient: gradient })
                }
                onHpColorChange={(color) => setLayout({ ...layout, hp_color: color })}
                onAcColorChange={(color) => setLayout({ ...layout, ac_color: color })}
              />
            </div>

            {/* Badge Positioning */}
            {layout.card_type === 'enhanced' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Badge Positioning</h2>
                <BadgePositioningEditor
                  stats={layout.stats_config.filter(s => s.visible)}
                  badges={layout.badge_layout}
                  onChange={(badges) => setLayout({ ...layout, badge_layout: badges })}
                />
              </div>
            )}
          </div>

          {/* Right Panel: Preview */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
              <CardPreview layout={layout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
