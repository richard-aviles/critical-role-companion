import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Set the authorization token for authenticated requests
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
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

export interface Character {
  id: string;
  campaign_id: string;
  name: string;
  slug: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
  image_url?: string;
  image_r2_key?: string;
  level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCharacterData {
  campaign_id: string;
  name: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
  level?: number;
}

export interface UpdateCharacterData {
  name?: string;
  class_name?: string;
  race?: string;
  player_name?: string;
  description?: string;
  backstory?: string;
  level?: number;
  is_active?: boolean;
}

/**
 * Create a new character
 */
export const createCharacter = async (data: CreateCharacterData): Promise<Character> => {
  try {
    const response = await apiClient.post('/characters', data);
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
export const getCharacter = async (characterId: string): Promise<Character> => {
  try {
    const response = await apiClient.get(`/characters/${characterId}`);
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
 * Update a character (supports both JSON and multipart/form-data for image uploads)
 */
export const updateCharacter = async (
  characterId: string,
  data: UpdateCharacterData | FormData
): Promise<Character> => {
  try {
    const response = await apiClient.patch(`/characters/${characterId}`, data);
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
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    await apiClient.delete(`/characters/${characterId}`);
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

export const createEpisode = async (data: CreateEpisodeData): Promise<Episode> => {
  const response = await apiClient.post('/episodes', data);
  return response.data;
};

export const getEpisodes = async (campaignId: string): Promise<Episode[]> => {
  const response = await apiClient.get(`/campaigns/${campaignId}/episodes`);
  return response.data;
};

export const getEpisode = async (episodeId: string): Promise<Episode> => {
  const response = await apiClient.get(`/episodes/${episodeId}`);
  return response.data;
};

export const updateEpisode = async (episodeId: string, data: UpdateEpisodeData): Promise<Episode> => {
  const response = await apiClient.patch(`/episodes/${episodeId}`, data);
  return response.data;
};

export const deleteEpisode = async (episodeId: string): Promise<void> => {
  await apiClient.delete(`/episodes/${episodeId}`);
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

export const createEvent = async (episodeId: string, data: CreateEventData): Promise<Event> => {
  const response = await apiClient.post(`/episodes/${episodeId}/events`, data);
  return response.data;
};

export const getEvents = async (episodeId: string): Promise<Event[]> => {
  const response = await apiClient.get(`/episodes/${episodeId}/events`);
  return response.data;
};

export const updateEvent = async (episodeId: string, eventId: string, data: UpdateEventData): Promise<Event> => {
  const response = await apiClient.patch(`/episodes/${episodeId}/events/${eventId}`, data);
  return response.data;
};

export const deleteEvent = async (episodeId: string, eventId: string): Promise<void> => {
  await apiClient.delete(`/episodes/${episodeId}/events/${eventId}`);
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