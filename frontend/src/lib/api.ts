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