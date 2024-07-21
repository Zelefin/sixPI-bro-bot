from aiohttp.web_request import Request
from aiohttp import web
from aiohttp.web_response import json_response

from infrastructure.database.repo.requests import RequestsRepo


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
    app.router.add_get("/get_balance", get_balance)
