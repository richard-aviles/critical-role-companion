from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncio, os
from typing import Optional, Dict, Any, List

from settings import settings
from db import init_db, fetch_all_characters, insert_character, set_on_screen

app = FastAPI(title="CR Companion API", version=os.getenv("COMMIT_SHA", "dev"))

# --- CORS ---
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Startup: ensure tables exist in staging ---
@app.on_event("startup")
def _startup():
    try:
        init_db()
        print("DB init: OK (tables ensured)")
    except Exception as e:
        print("DB init failed:", e)

# --- Health/version ---
@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/version")
def version():
    return {"version": app.version, "env": settings.ENV}

# --- WS hub for live overlay updates ---
clients = set()

async def ping_loop(ws: WebSocket, interval: int):
    while True:
        await asyncio.sleep(interval)
        try:
            await ws.send_text("__ping__")
        except Exception:
            break

@app.websocket("/ws/updates")
async def ws_updates(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    ping_task = asyncio.create_task(ping_loop(ws, settings.WS_PING_INTERVAL))
    try:
        while True:
            msg = await ws.receive_text()
            await ws.send_text(f"echo:{msg}")
    except WebSocketDisconnect:
        pass
    finally:
        ping_task.cancel()
        clients.discard(ws)

# --- Broadcast endpoint used by your admin UI ---
class Broadcast(BaseModel):
    channel: str
    payload: Dict[str, Any]

@app.post("/broadcast")
async def broadcast(b: Broadcast):
    dead = []
    for c in clients:
        try:
            await c.send_json({"channel": b.channel, "payload": b.payload})
        except Exception:
            dead.append(c)
    for d in dead:
        clients.discard(d)
    return {"delivered": len(clients)}

# --- Characters API (staging-friendly) ---
class CharacterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    on_screen: bool = False
    data: Optional[Dict[str, Any]] = None

class CharacterOut(CharacterIn):
    id: int

@app.get("/characters", response_model=List[CharacterOut])
def list_characters():
    return fetch_all_characters()

@app.post("/characters", response_model=CharacterOut, status_code=201)
def create_character(ch: CharacterIn):
    return insert_character(ch.name, ch.on_screen, ch.data)

@app.patch("/characters/{char_id}/on_screen", response_model=CharacterOut)
async def patch_on_screen(char_id: int, on_screen: bool):
    row = set_on_screen(char_id, on_screen)
    if not row:
        raise HTTPException(status_code=404, detail="Character not found")

    # --- broadcast update to all WS clients ---
    dead = []
    message = {"channel": "characters", "payload": {"type": "update", "character": row}}
    for c in clients:
        try:
            await c.send_json(message)
        except Exception:
            dead.append(c)
    for d in dead:
        clients.discard(d)

    return row

