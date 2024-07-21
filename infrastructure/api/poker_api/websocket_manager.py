from typing import Dict, Set
from aiohttp import web
from infrastructure.api.poker_api.table import get_table


class WebSocketManager:
    def __init__(self):
        self.table_connections: Dict[str, Set[web.WebSocketResponse]] = {}

    async def handle_websocket(self, request: web.Request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        table_id = request.match_info["table_id"]
        table = get_table(table_id)

        if not table:
            await ws.close()
            return ws

        if table_id not in self.table_connections:
            self.table_connections[table_id] = set()

        self.table_connections[table_id].add(ws)
        table.add_player()

        try:
            await self.broadcast_player_count(table_id)
            async for msg in ws:
                if msg.type == web.WSMsgType.TEXT:
                    if msg.data == "close":
                        await ws.close()
                elif msg.type == web.WSMsgType.ERROR:
                    print(
                        f"WebSocket connection closed with exception {ws.exception()}"
                    )
        finally:
            self.table_connections[table_id].remove(ws)
            table.remove_player()
            await self.broadcast_player_count(table_id)

        return ws

    async def broadcast_player_count(self, table_id: str):
        table = get_table(table_id)
        if table and table_id in self.table_connections:
            message = {"type": "player_count", "count": table.current_players}
            for ws in self.table_connections[table_id]:
                await ws.send_json(message)


websocket_manager = WebSocketManager()
