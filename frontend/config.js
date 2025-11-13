// config.js
// 1) ?api=<url> query param
// 2) fallback to your staging backend
const params = new URLSearchParams(window.location.search);
export const API_BASE =
  params.get("api") || "https://cr-overlay-staging-bold-feather-4496.fly.dev";

export const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/updates";
