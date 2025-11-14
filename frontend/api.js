// api.js
import { API_BASE, WS_URL } from "./config.js";

async function http(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// REST
export async function getCharacters() {
  return http("GET", "/characters");
}
export async function setOnScreen(id, on_screen) {
  return http("PATCH", `/characters/${id}/on_screen?on_screen=${on_screen ? "true" : "false"}`);
}

// Broadcast helper (admin -> viewers)
export async function broadcastUI(type, value) {
  const res = await fetch(`${API_BASE}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: "ui", payload: { type, value } }),
  });
  if (!res.ok) throw new Error(`broadcast failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// WebSocket with auto-reconnect
export function connectUpdates({ onOpen, onClose, onMessage, retryMs = 1500, pingFilter="__ping__" }) {
  let ws, stopped = false;
  const open = () => {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => onOpen?.(ws);
    ws.onclose = () => { onClose?.(); if (!stopped) setTimeout(open, retryMs); };
    ws.onmessage = (e) => {
      if (e.data === pingFilter) return;
      try { onMessage?.(JSON.parse(e.data)); }
      catch { onMessage?.(e.data); }
    };
  };
  open();
  return {
    send: (data) => ws?.readyState === 1 && ws.send(typeof data === "string" ? data : JSON.stringify(data)),
    stop: () => { stopped = true; try { ws?.close(); } catch {} },
  };
}
