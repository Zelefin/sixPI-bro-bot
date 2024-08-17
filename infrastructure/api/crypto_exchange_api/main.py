from pathlib import Path
import aiohttp_cors
from aiohttp import web
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request

from infrastructure.api.crypto_exchange_api.buy_route import buy
from infrastructure.api.crypto_exchange_api.market_routes import (
    get_basic_coins,
    search,
)
from infrastructure.api.crypto_exchange_api.sell_route import sell
from infrastructure.api.crypto_exchange_api.top_transactions_route import (
    get_top_transactions,
)
from infrastructure.api.crypto_exchange_api.user_transactions_route import transactions


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[3].resolve()
        / "frontend/crypto-exchange-app/dist/index.html"
    )


def setup_crypto_exchange_routes(app: web.Application):
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True, expose_headers="*", allow_headers="*"
            )
        },
    )
    app.router.add_get("", index_handler)
    app.router.add_get("/basic_coins", get_basic_coins)
    app.router.add_post("/search", search)
    app.router.add_post("/buy", buy)
    app.router.add_post("/sell", sell)
    app.router.add_post("/transactions", transactions)
    app.router.add_get("/top_transactions", get_top_transactions)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[3].resolve()
        / "frontend/crypto-exchange-app/dist/assets",
    )

    for route in list(app.router.routes()):
        cors.add(route)
