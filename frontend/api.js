// api.js
import { API_BASE, WS_URL } from "./config.js";

async function http(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    // include credentials later if you add auth
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// --- REST endpoints ---
export async function getCharacters() {
  return http("GET", "/characters");
}

export async function createCharacter({ name, on_screen = false, data = null }) {
  return http("POST", "/characters", { name, on_screen, data });
}

export async function setOnScreen(id, on_screen) {
  // PATCH /characters/{id}/on_screen?on_screen=true|false
  const url = `/characters/${id}/on_screen?on_screen=${on_screen ? "true" : "false"}`;
  return http("PATCH", url);
}

// --- WebSocket with auto-reconnect & heartbeat ---
export function connectUpdates({ onOpen, onClose, onMessage, pingFilter = "__ping__", retryMs = 1500 }) {
  let ws;
  let stopped = false;

  const open = () => {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => onOpen?.(ws);
    ws.onclose = () => {
      onClose?.();
      if (!stopped) setTimeout(open, retryMs);
    };
    ws.onmessage = (e) => {
      if (e.data === pingFilter) return; // ignore server pings
      try {
        const msg = JSON.parse(e.data);
        onMessage?.(msg);
      } catch {
        onMessage?.(e.data); // fall back to raw
      }
    };
  };

  open();

  return {
    send: (data) => ws?.readyState === 1 && ws.send(typeof data === "string" ? data : JSON.stringify(data)),
    stop: () => { stopped = true; try { ws?.close(); } catch {} },
  };
}
