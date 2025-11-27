'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCampaignLayouts, createCharacterLayout, updateCharacterLayout, uploadLayoutBackgroundImage } from '@/lib/api';
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
  background_image_offset_x?: number;
  background_image_offset_y?: number;
  border_colors: string[];
  badge_colors: string[];
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
  badge_colors: ['#FFD700', '#DC7F2E'],
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
  console.log('[CardLayoutPage] Component rendering');
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
    badge_colors: DEFAULT_GOLD_THEME.badge_colors,
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
      console.log('[handleSave] Starting save process:', {
        campaignId,
        hasExistingLayout: !!existingLayout?.id,
        existingLayoutId: existingLayout?.id,
        hasBackgroundImage: !!layout.background_image_url,
        backgroundImageUrl: layout.background_image_url?.substring(0, 50),
      });

      // Get the campaign token from localStorage
      const token = localStorage.getItem(`campaign_${campaignId}_token`);
      if (!token) {
        setError('Campaign token not found. Please go back and re-enter admin mode.');
        setSaving(false);
        return;
      }

      let layoutToUpdate = existingLayout;

      if (existingLayout?.id) {
        console.log('[handleSave] Updating existing layout:', existingLayout.id);
        // Update existing layout
        await updateCharacterLayout(campaignId, existingLayout.id, layout);
      } else {
        console.log('[handleSave] Creating new layout');
        // Create new layout
        const newLayout = await createCharacterLayout(campaignId, layout);
        console.log('[handleSave] New layout created:', { id: newLayout.id, name: newLayout.name });
        setExistingLayout(newLayout);
        layoutToUpdate = newLayout;
      }

      console.log('[handleSave] After create/update, layoutToUpdate:', {
        id: layoutToUpdate?.id,
        hasBackgroundImage: !!layout.background_image_url,
        isDataUrl: layout.background_image_url?.startsWith('data:'),
      });

      // If layout has a background image URL that's a data URL (local preview), upload it
      if (layoutToUpdate?.id && layout.background_image_url && layout.background_image_url.startsWith('data:')) {
        console.log('[handleSave] Converting data URL to file and uploading');
        // Convert data URL to File object and upload
        const blob = await fetch(layout.background_image_url).then(res => res.blob());
        const file = new File([blob], 'background.png', { type: 'image/png' });

        console.log('[handleSave] Calling uploadLayoutBackgroundImage:', {
          campaignId,
          layoutId: layoutToUpdate.id,
          fileName: file.name,
          fileSize: file.size,
        });

        const result = await uploadLayoutBackgroundImage(campaignId, layoutToUpdate.id, file);

        console.log('[handleSave] Upload successful, updating layout with server URL');
        // Update layout with the server URL
        layout.background_image_url = result.url;
        await updateCharacterLayout(campaignId, layoutToUpdate.id, layout);
      }

      console.log('[handleSave] Save completed successfully');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[handleSave] Error during save:', err);
      setError(err instanceof Error ? err.message : 'Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading layout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow dark:shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Character Card Layout</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/campaigns/${campaignId}`)}
                className="px-4 py-2 border border-purple-300 dark:border-purple-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:-translate-y-0.5 transition-all duration-200 font-medium shadow-sm focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
              >
                ← Back to Campaign
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 dark:bg-purple-700 text-white font-medium rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 transition-colors duration-200 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
              >
                {saving ? 'Saving...' : 'Save Layout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Fixed at top */}
      {error && (
        <div className="fixed top-20 left-4 right-4 z-50 flex justify-center">
          <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 border border-gray-200 dark:border-gray-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-md shadow-lg">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-20 left-4 right-4 z-50 flex justify-center">
          <div className="max-w-2xl w-full bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500 border border-gray-200 dark:border-gray-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-md shadow-lg">
            Layout saved successfully!
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-900 shadow dark:shadow-lg border-b border-gray-200 dark:border-gray-800 border-t-2 border-t-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Show cards for each card type to compare */}
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Simple Card Style</div>
              <div className="max-w-sm">
                <CardPreview
                  layout={{
                    ...layout,
                    card_type: 'simple',
                  }}
                />
              </div>
            </div>

            {/* Enhanced Card Preview */}
            <div className="md:col-span-1 lg:col-span-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enhanced Card Style (Current Selection)</div>
              <div className="max-w-2xl">
                <CardPreview layout={layout} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Card Type */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg border-l-4 border-l-purple-500 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Style</h2>
            <CardTypeToggle
              cardType={layout.card_type}
              onChange={(type) => setLayout({ ...layout, card_type: type })}
            />
          </div>

          {/* Stats Configuration */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg border-l-4 border-l-purple-500 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Character Stats</h2>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg border-l-4 border-l-purple-500 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image Settings</h2>
            <ImageSettingsPanel
              widthPercent={layout.image_width_percent}
              aspectRatio={layout.image_aspect_ratio}
              backgroundImageUrl={layout.background_image_url}
              campaignId={campaignId}
              layoutId={existingLayout?.id}
              onWidthChange={(width) => setLayout({ ...layout, image_width_percent: width })}
              onAspectRatioChange={(ratio) =>
                setLayout({ ...layout, image_aspect_ratio: ratio })
              }
              onBackgroundImageChange={(data) =>
                setLayout({
                  ...layout,
                  background_image_url: data.url,
                  background_image_offset_x: data.offset_x || 0,
                  background_image_offset_y: data.offset_y || 0,
                })
              }
            />
          </div>

          {/* Color Theme */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg border-l-4 border-l-purple-500 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Theme</h2>
            <ColorThemeSelector
              borderColors={layout.border_colors}
              badgeColors={layout.badge_colors}
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
              onBadgeColorsChange={(colors) =>
                setLayout({ ...layout, badge_colors: colors })
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-lg border-l-4 border-l-purple-500 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badge Positioning</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Badge Editor Canvas */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Positioning Canvas</div>
                  <BadgePositioningEditor
                    stats={layout.stats_config.filter(s => s.visible)}
                    badges={layout.badge_layout}
                    onChange={(badges) => setLayout({ ...layout, badge_layout: badges })}
                  />
                </div>

                {/* Live Card Preview */}
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Live Card Preview</div>
                  <CardPreview layout={layout} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
