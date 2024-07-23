from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_response import json_response
from aiohttp.web_fileresponse import FileResponse
from pathlib import Path

import aiohttp_cors
from infrastructure.api.poker_api.table import (
    get_available_tables,
    create_table,
    get_table,
)
from infrastructure.api.poker_api.websocket_manager import websocket_manager


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/poker-app/dist/index.html"
    )


async def get_tables(request: Request):
    tables = get_available_tables()
    return json_response(
        [
            {
                "id": table.id,
                "name": table.name,
                "smallBlind": table.small_blind,
                "bigBlind": table.big_blind,
                "minBuyIn": table.min_buy_in,
                "maxBuyIn": table.max_buy_in,
                "maxPlayers": table.max_players,
                "currentPlayers": table.current_players,
            }
            for table in tables
        ]
    )


async def create_table_handler(request: Request):
    data = await request.json()
    name = data.get("name")
    min_buy_in = data.get("minBuyIn")
    max_buy_in = data.get("maxBuyIn")
    max_players = data.get("maxPlayers")

    if not all([name, min_buy_in, max_buy_in, max_players]):
        return web.Response(status=400, text="Missing required fields")

    new_table = create_table(name, min_buy_in, max_buy_in, max_players)
    return json_response(
        {
            "id": new_table.id,
            "name": new_table.name,
            "smallBlind": new_table.small_blind,
            "bigBlind": new_table.big_blind,
            "minBuyIn": new_table.min_buy_in,
            "maxBuyIn": new_table.max_buy_in,
            "maxPlayers": new_table.max_players,
            "currentPlayers": new_table.current_players,
        }
    )


async def get_table_details(request: Request):
    table_id = request.match_info["table_id"]
    table = get_table(table_id)
    if not table:
        return web.Response(status=404, text="Table not found")

    return json_response(
        {
            "id": table.id,
            "name": table.name,
            "smallBlind": table.small_blind,
            "bigBlind": table.big_blind,
            "minBuyIn": table.min_buy_in,
            "maxBuyIn": table.max_buy_in,
            "maxPlayers": table.max_players,
            "currentPlayers": table.current_players,
        }
    )


def setup_poker_routes(app: web.Application):
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True, expose_headers="*", allow_headers="*"
            )
        },
    )
    app.router.add_get("", index_handler)
    app.router.add_get("/api/tables", get_tables)
    app.router.add_post("/api/create_table", create_table_handler)
    app.router.add_get("/api/tables/{table_id}", get_table_details)
    app.router.add_get("/ws/{table_id}", websocket_manager.handle_websocket)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/poker-app/dist/assets",
    )
    for route in list(app.router.routes()):
        cors.add(route)
