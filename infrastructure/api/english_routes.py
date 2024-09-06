from pathlib import Path
from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_fileresponse import FileResponse


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/english-app/dist/index.html"
    )


def setup_english_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/english-app/dist/assets",
    )
