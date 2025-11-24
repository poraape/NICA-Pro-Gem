import asyncio
from typing import Dict, List

import orjson
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from redis.asyncio import Redis

from app.core.config import settings

router = APIRouter(tags=["ws"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active: List[WebSocket] = []
        self._listener_task: asyncio.Task | None = None
        self.redis: Redis = Redis.from_url(settings.redis_url)

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)
        if not self._listener_task or self._listener_task.done():
            self._listener_task = asyncio.create_task(self._stream_listener())

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: Dict) -> None:
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(orjson.dumps(message).decode())
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def _stream_listener(self) -> None:
        last_id = "0-0"
        while True:
            try:
                streams = await self.redis.xread({"agent:events": last_id}, block=1000, count=10)
                if not streams:
                    await asyncio.sleep(0.1)
                    continue
                for _, events in streams:
                    for event_id, data in events:
                        last_id = event_id
                        if b"json" in data:
                            payload = orjson.loads(data[b"json"])
                            await self.broadcast(payload)
            except Exception:  # pragma: no cover - keep running
                await asyncio.sleep(1)


manager = ConnectionManager()


@router.websocket("/ws/agents")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keepalive; commands can be parsed later
    except WebSocketDisconnect:
        manager.disconnect(websocket)
