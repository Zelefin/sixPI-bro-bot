from pathlib import Path
import time
from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_fileresponse import FileResponse
from infrastructure.api.common_routes import (
    check_rate_limit,
    update_user_balance,
    get_user_balance,
)
from infrastructure.api.utils import validate_telegram_data, parse_init_data
from infrastructure.database.repo.requests import RequestsRepo
import json
from redis.asyncio.client import Redis


COOLDOWN_PERIOD = 120


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/english-app/dist/index.html"
    )


async def award_points(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return web.json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(data.get("_auth"))
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    if check_rate_limit(user_id):
        return web.json_response(
            {"ok": False, "err": "Rate limit exceeded"}, status=429
        )

    redis: Redis = request.app["redis"]
    key = f"{user_id}:english"

    if await redis.exists(key):
        time_left = await redis.ttl(key)
        return web.json_response({"ok": False, "timeLeft": time_left}, status=429)

    session_pool = request.app["session_pool"]

    async with session_pool() as session:
        repo = RequestsRepo(session)
        current_balance = await get_user_balance(user_id, repo)
        new_balance = current_balance + 5  # Award 5 points
        await update_user_balance(user_id, new_balance, repo)

    await redis.set(key, "1", ex=COOLDOWN_PERIOD)

    return web.json_response({"ok": True, "newBalance": new_balance})


async def get_cooldown(request: Request):
    auth_header = request.headers.get("_auth")
    if not auth_header or not validate_telegram_data(auth_header):
        return web.json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(auth_header)
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    redis: Redis = request.app["redis"]
    key = f"{user_id}:english"

    time_left = await redis.ttl(key)
    time_left = max(0, time_left)  # Ensure non-negative value

    return web.json_response({"ok": True, "cooldownTime": time_left})


def setup_english_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_post("/award-points", award_points)
    app.router.add_get("/get-cooldown", get_cooldown)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/english-app/dist/assets",
    )
