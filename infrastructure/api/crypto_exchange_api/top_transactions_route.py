import json
from aiohttp.web_response import json_response
from aiohttp.web_request import Request

from infrastructure.api.crypto_exchange_api.utils import format_transaction
from infrastructure.database.repo.requests import RequestsRepo


async def get_top_transactions(request: Request):
    session_pool = request.app["session_pool"]
    redis = request.app["redis"]
    config = request.app["config"]

    async with session_pool() as session:
        repo = RequestsRepo(session)
        top_transactions = await repo.crypto_transactions.get_top_transactions()

        formatted_transactions = [
            format_transaction(redis, config, t) for t in top_transactions
        ]
        return json_response({"ok": True, "top_transactions": formatted_transactions})
