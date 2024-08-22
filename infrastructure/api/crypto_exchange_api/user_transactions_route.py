import json
from aiohttp.web_response import json_response
from aiohttp.web_request import Request

from infrastructure.api.common_routes import check_rate_limit
from infrastructure.api.crypto_exchange_api.utils import format_transaction
from infrastructure.api.utils import parse_init_data, validate_telegram_data
from infrastructure.database.repo.requests import RequestsRepo


async def transactions(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(data["_auth"])
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    if not user_id:
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    if check_rate_limit(user_id):
        return json_response({"ok": False, "err": "Rate limit exceeded"}, status=429)

    session_pool = request.app["session_pool"]
    redis = request.app["redis"]
    config = request.app["config"]

    async with session_pool() as session:
        repo = RequestsRepo(session)
        open_transactions, closed_transactions = (
            await repo.crypto_transactions.get_user_transactions_split(user_id)
        )

        return json_response(
            {
                "ok": True,
                "open_transactions": [
                    await format_transaction(redis, config, t)
                    for t in open_transactions
                ],
                "closed_transactions": [
                    await format_transaction(redis, config, t)
                    for t in closed_transactions
                ],
            }
        )
