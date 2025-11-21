/**
 * Client-side authentication utilities
 * Manages token storage and user session
 */

const TOKEN_KEY = 'cr_admin_token';
const USER_EMAIL_KEY = 'cr_admin_email';
const CAMPAIGNS_KEY = 'cr_campaigns';

/**
 * Save auth token to localStorage
 */
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get auth token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save user email to localStorage
 */
export const saveUserEmail = (email: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_EMAIL_KEY, email);
  }
};

/**
 * Get user email from localStorage
 */
export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(USER_EMAIL_KEY);
};

/**
 * Save user's campaigns to localStorage
 */
export const saveCampaigns = (campaigns: any[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }
};

/**
 * Get user's campaigns from localStorage
 */
export const getCampaigns = (): any[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(CAMPAIGNS_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};

/**
 * Clear all auth data from localStorage
 */
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(CAMPAIGNS_KEY);
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): { email: string; campaigns: any[] } | null => {
  const email = getUserEmail();
  const campaigns = getCampaigns();

  if (!email) {
    return null;
  }

  return {
    email,
    campaigns,
  };
};
