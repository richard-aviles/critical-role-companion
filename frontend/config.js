// config.js
// Resolves the API base in this priority:
// 1) ?api=<url> query param (great for OBS testing)
// 2) Vite env (VITE_API_BASE) if you add a build step later
// 3) Hardcoded fallback to your staging backend
const qp = new URLSearchParams(location.search);
const apiFromQuery = qp.get("api");

export const API_BASE =
  apiFromQuery ||
  (typeof import !== "undefined" && import.meta?.env?.VITE_API_BASE) ||
  "https://cr-overlay-staging-bold-feather-4496.fly.dev";

// Helper to build a WS URL from API_BASE
export const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/updates";
