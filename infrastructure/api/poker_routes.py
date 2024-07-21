from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_response import json_response
from aiohttp.web_fileresponse import FileResponse
from pathlib import Path


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/poker-app/dist/index.html"
    )


def setup_poker_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/poker-app/dist/assets",
    )
