// config.js
// Detect the API base in this order:
// 1) ?api=<url> query param
// 2) Environment variable (Vite builds only)
// 3) Default to your staging backend

const params = new URLSearchParams(window.location.search);
let apiFromQuery = params.get("api");

let envBase = undefined;
try {
  // Safe check (works even if import.meta is undefined)
  if (typeof import !== "undefined" && import.meta && import.meta.env) {
    envBase = import.meta.env.VITE_API_BASE;
  }
} catch (e) {
  // ignore if not supported
}

export const API_BASE =
  apiFromQuery ||
  envBase ||
  "https://cr-overlay-staging-bold-feather-4496.fly.dev";

export const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/updates";
