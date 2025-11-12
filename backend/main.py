from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from settings import settings

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

# --- Health/version ---
@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/version")
def version():
    return {"version": app.version, "env": settings.ENV}

# --- Simple WS hub for testing ---
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
            # Echo back for now; your app will broadcast updates
            await ws.send_text(f"echo:{msg}")
    except WebSocketDisconnect:
        pass
    finally:
        ping_task.cancel()
        clients.discard(ws)

# --- Example broadcast endpoint ---
class Broadcast(BaseModel):
    channel: str
    payload: dict

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
