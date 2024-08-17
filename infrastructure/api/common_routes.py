import time
from aiohttp.web_request import Request
from aiohttp import web
from aiohttp.web_response import json_response
import aiohttp_cors

from infrastructure.database.repo.requests import RequestsRepo


# Rate limiting
RATE_LIMIT = 2  # requests per second
last_request_time = {}


def check_rate_limit(user_id: int) -> bool:
    current_time = time.time()
    if user_id in last_request_time:
        time_passed = current_time - last_request_time[user_id]
        if time_passed < 1 / RATE_LIMIT:
            return True
    last_request_time[user_id] = current_time
    return False


async def get_user_balance(user_id: int, repo: RequestsRepo) -> int:
    return await repo.rating_users.get_rating_by_user_id(user_id) or 0


async def update_user_balance(
    user_id: int, new_balance: int, repo: RequestsRepo
) -> None:
    await repo.rating_users.update_rating_by_user_id(user_id, new_balance)


async def get_balance(request: Request):
    user_id: str | None = request.rel_url.query.get("user_id")
    if not user_id:
        return json_response({"balance": 0})
    session_pool = request.app["session_pool"]
    async with session_pool() as session:
        repo = RequestsRepo(session)
        balance = await get_user_balance(int(user_id), repo)
    return json_response({"balance": balance})


def setup_common_routes(app: web.Application):
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True, expose_headers="*", allow_headers="*"
            )
        },
    )
    app.router.add_get("/get_balance", get_balance)

    for route in list(app.router.routes()):
        cors.add(route)
