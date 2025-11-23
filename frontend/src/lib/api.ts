import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Set default JSON content type for non-FormData requests
apiClient.interceptors.request.use((config) => {
  // Don't set Content-Type if data is FormData (let browser handle it)
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

/**
 * Set the authorization token for authenticated requests
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('API Client - Authorization header set');
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('API Client - Authorization header removed');
  }
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

interface SignupPayload {
  email: string;
  password: string;
}

interface SignupResponse {
  id: string;
  email: string;
  created_at: string;
}

export const signup = async (payload: SignupPayload): Promise<SignupResponse> => {
  const response = await apiClient.post('/auth/signup', payload);
  return response.data;
};

interface LoginPayload {
  email: string;
  password: string;
}

interface Campaign {
  id: string;
  slug: string;
  name: string;
  admin_token: string;
}

interface LoginResponse {
  user_id: string;
  email: string;
  campaigns: Campaign[];
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

// ============================================================================
// CAMPAIGNS
// ============================================================================

export const getCampaigns = async () => {
  const response = await apiClient.get('/campaigns');
  return response.data;
};

export const getCampaign = async (campaignId: string) => {
  const response = await apiClient.get(`/campaigns/${campaignId}`);
  return response.data;
};

interface CampaignCreatePayload {
  slug: string;
  name: string;
  description?: string;
}

interface CampaignUpdatePayload {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
}

interface CampaignResponse {
  id: string;
  slug: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  admin_token?: string;
}

export const createCampaign = async (payload: CampaignCreatePayload): Promise<CampaignResponse> => {
  const response = await apiClient.post('/campaigns', payload);
  return response.data;
};

export const getCampaignDetail = async (campaignId: string): Promise<CampaignResponse> => {
  const response = await apiClient.get(`/campaigns/${campaignId}`);
  return response.data;
};

export const updateCampaign = async (
  campaignId: string,
  payload: CampaignUpdatePayload
): Promise<CampaignResponse> => {
  const response = await apiClient.patch(`/campaigns/${campaignId}`, payload);
  return response.data;
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  await apiClient.delete(`/campaigns/${campaignId}`);
};

// ============================================================================
// CHARACTERS
// ============================================================================

export interface ColorThemeOverride {
  border_colors: string[];
  text_color: string;
  badge_interior_gradient: {
    type: string;
    colors: string[];
  };
  hp_color: {
    border: string;
    interior_gradient: {
      type: string;
      colors: string[];
    };
  };
  ac_color: {
    border: string;
    interior_gradient: {
      type: string;
      colors: string[];
    };
  };
}

export interface Character {
  id: string;
  campaign_id: string;
  name: string;
  slug?: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
  image_url?: string;
  image_r2_key?: string;
  level?: number;
  is_active?: boolean;
  color_theme_override?: ColorThemeOverride | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCharacterData {
  campaign_id: string;
  name: string;
  slug?: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
}

export interface UpdateCharacterData {
  name?: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
  color_theme_override?: ColorThemeOverride | null;
}

/**
 * Helper function to generate slug from text
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Create a new character
 */
export const createCharacter = async (data: CreateCharacterData, adminToken?: string): Promise<Character> => {
  try {
    const { campaign_id, ...characterData } = data;
    // Generate slug from name
    const slug = generateSlug(data.name);

    // Use campaign admin token for this request if provided
    const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};

    const response = await apiClient.post(`/campaigns/${campaign_id}/characters`, {
      ...characterData,
      slug,
    }, config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to create character');
  }
};

/**
 * Get all characters for a campaign
 */
export const getCharacters = async (campaignId: string): Promise<Character[]> => {
  try {
    const response = await apiClient.get(`/campaigns/${campaignId}/characters`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Campaign not found');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to fetch characters');
  }
};

/**
 * Get a single character by ID
 */
export const getCharacter = async (campaignId: string, characterId: string): Promise<Character> => {
  try {
    const response = await apiClient.get(`/campaigns/${campaignId}/characters/${characterId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to fetch character');
  }
};

/**
 * Update a character - text fields via JSON, images via separate endpoint
 */
export const updateCharacter = async (
  campaignId: string,
  characterId: string,
  data: UpdateCharacterData | FormData,
  imageFile?: File,
  adminToken?: string
): Promise<Character> => {
  try {
    // Use campaign admin token for this request if provided
    const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};

    // If it's FormData, it's an image upload to the dedicated endpoint
    if (data instanceof FormData) {
      console.log('[API] Uploading image to:', `/campaigns/${campaignId}/characters/${characterId}/image`);
      const response = await apiClient.patch(
        `/campaigns/${campaignId}/characters/${characterId}/image`,
        data,
        config
      );
      return response.data;
    }

    // Otherwise, it's JSON data for text fields
    console.log('[API] Updating character with JSON data:', {
      endpoint: `/campaigns/${campaignId}/characters/${characterId}`,
      data,
      hasColorOverride: 'color_theme_override' in data,
    });
    const response = await apiClient.patch(
      `/campaigns/${campaignId}/characters/${characterId}`,
      data,
      config
    );
    console.log('[API] Update response:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this character');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to update character');
  }
};

/**
 * Delete a character
 */
export const deleteCharacter = async (campaignId: string, characterId: string, adminToken?: string): Promise<void> => {
  try {
    // Use campaign admin token for this request if provided
    const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};

    await apiClient.delete(`/campaigns/${campaignId}/characters/${characterId}`, config);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete this character');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to delete character');
  }
};

/**
 * Set character color theme override
 */
export const setCharacterColorOverride = async (
  campaignId: string,
  characterId: string,
  colors: ColorThemeOverride
): Promise<Character> => {
  try {
    const response = await apiClient.post(
      `/campaigns/${campaignId}/characters/${characterId}/color-theme`,
      {
        border_colors: colors.border_colors,
        text_color: colors.text_color,
        badge_interior_gradient: colors.badge_interior_gradient,
        hp_color: colors.hp_color,
        ac_color: colors.ac_color,
      }
    );
    return response.data.character;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this character');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to set color override');
  }
};

/**
 * Clear character color theme override
 */
export const clearCharacterColorOverride = async (
  campaignId: string,
  characterId: string
): Promise<Character> => {
  try {
    const response = await apiClient.delete(
      `/campaigns/${campaignId}/characters/${characterId}/color-theme`
    );
    return response.data.character;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this character');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to clear color override');
  }
};

/**
 * Get resolved character colors (with fallback logic)
 */
export interface ResolvedColorsResponse {
  character_id: string;
  source: 'character_override' | 'campaign_default' | 'system_default';
  colors: ColorThemeOverride;
}

export const getResolvedCharacterColors = async (
  campaignId: string,
  characterId: string
): Promise<ResolvedColorsResponse> => {
  try {
    const response = await apiClient.get(
      `/campaigns/${campaignId}/characters/${characterId}/resolved-colors`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to fetch resolved colors');
  }
};

// ============================================================================
// EPISODES
// ============================================================================

export interface Episode {
  id: string;
  campaign_id: string;
  name: string;
  slug: string;
  episode_number?: number;
  season?: number;
  description?: string;
  air_date?: string;
  runtime?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEpisodeData {
  campaign_id: string;
  name: string;
  slug?: string;
  episode_number?: number;
  season?: number;
  description?: string;
  air_date?: string;
  runtime?: number;
  is_published?: boolean;
}

export interface UpdateEpisodeData {
  name?: string;
  slug?: string;
  episode_number?: number;
  season?: number;
  description?: string;
  air_date?: string;
  runtime?: number;
  is_published?: boolean;
}

export const createEpisode = async (data: CreateEpisodeData, adminToken?: string): Promise<Episode> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.post(`/campaigns/${data.campaign_id}/episodes`, data, config);
  return response.data;
};

export const getEpisodes = async (campaignId: string): Promise<Episode[]> => {
  const response = await apiClient.get(`/campaigns/${campaignId}/episodes`);
  return response.data;
};

export const getEpisode = async (campaignId: string, episodeId: string): Promise<Episode> => {
  const response = await apiClient.get(`/campaigns/${campaignId}/episodes/${episodeId}`);
  return response.data;
};

export const updateEpisode = async (campaignId: string, episodeId: string, data: UpdateEpisodeData, adminToken?: string): Promise<Episode> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.patch(`/campaigns/${campaignId}/episodes/${episodeId}`, data, config);
  return response.data;
};

export const deleteEpisode = async (campaignId: string, episodeId: string, adminToken?: string): Promise<void> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  await apiClient.delete(`/campaigns/${campaignId}/episodes/${episodeId}`, config);
};

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string;
  episode_id: string;
  name: string;
  description?: string;
  timestamp_in_episode?: number;
  event_type?: string;
  characters_involved?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  name: string;
  description?: string;
  timestamp_in_episode?: number;
  event_type?: string;
  characters_involved?: string[];
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  timestamp_in_episode?: number;
  event_type?: string;
  characters_involved?: string[];
}

export const createEvent = async (episodeId: string, data: CreateEventData, adminToken?: string): Promise<Event> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.post(`/episodes/${episodeId}/events`, data, config);
  return response.data;
};

export const getEvents = async (episodeId: string, adminToken?: string): Promise<Event[]> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.get(`/episodes/${episodeId}/events`, config);
  return response.data;
};

export const updateEvent = async (episodeId: string, eventId: string, data: UpdateEventData, adminToken?: string): Promise<Event> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  const response = await apiClient.patch(`/episodes/${episodeId}/events/${eventId}`, data, config);
  return response.data;
};

export const deleteEvent = async (episodeId: string, eventId: string, adminToken?: string): Promise<void> => {
  const config = adminToken ? { headers: { 'X-Token': adminToken } } : {};
  await apiClient.delete(`/episodes/${episodeId}/events/${eventId}`, config);
};

// ============================================================================
// PUBLIC ENDPOINTS (Phase 3 Tier 3 - Campaign Website Pages)
// ============================================================================

/**
 * Get campaign by slug (public - no auth required)
 */
export const getPublicCampaign = async (slug: string): Promise<Campaign> => {
  try {
    const response = await apiClient.get(`/public/campaigns/${slug}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Campaign not found');
    }
    throw new Error('Failed to fetch campaign');
  }
};

/**
 * Get active characters for campaign by slug (public - no auth required)
 */
export const getPublicCharacters = async (campaignSlug: string): Promise<Character[]> => {
  try {
    const response = await apiClient.get(`/public/campaigns/${campaignSlug}/characters`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Campaign not found');
    }
    throw new Error('Failed to fetch characters');
  }
};

/**
 * Get character by slug for campaign (public - no auth required)
 */
export const getPublicCharacter = async (campaignSlug: string, characterSlug: string): Promise<Character> => {
  try {
    const response = await apiClient.get(`/public/campaigns/${campaignSlug}/characters/${characterSlug}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Character not found');
    }
    throw new Error('Failed to fetch character');
  }
};

/**
 * Get published episodes for campaign by slug (public - no auth required)
 */
export const getPublicEpisodes = async (campaignSlug: string): Promise<Episode[]> => {
  try {
    const response = await apiClient.get(`/public/campaigns/${campaignSlug}/episodes`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Campaign not found');
    }
    throw new Error('Failed to fetch episodes');
  }
};

/**
 * Get episode by slug for campaign (public - no auth required)
 */
export const getPublicEpisode = async (campaignSlug: string, episodeSlug: string): Promise<Episode> => {
  try {
    const response = await apiClient.get(`/public/campaigns/${campaignSlug}/episodes/${episodeSlug}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Episode not found');
    }
    throw new Error('Failed to fetch episode');
  }
};

/**
 * Get events for episode (public - no auth required)
 */
export const getPublicEvents = async (episodeId: string): Promise<Event[]> => {
  try {
    const response = await apiClient.get(`/public/episodes/${episodeId}/events`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Episode not found');
    }
    if (error.response?.status === 403) {
      throw new Error('Episode is not published');
    }
    throw new Error('Failed to fetch events');
  }
};

// ============================================================================
// HEALTH & VERSION
// ============================================================================

export const healthCheck = async () => {
  const response = await apiClient.get('/healthz');
  return response.data;
};

export const getVersion = async () => {
  const response = await apiClient.get('/version');
  return response.data;
};

export default apiClient;