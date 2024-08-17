import json
import logging
from aiohttp.web_response import json_response
from aiohttp.web_request import Request

from infrastructure.api.common_routes import (
    get_user_balance,
    update_user_balance,
    check_rate_limit,
)
from infrastructure.api.crypto_exchange_api.utils import get_coin_price
from infrastructure.api.utils import parse_init_data, validate_telegram_data
from infrastructure.database.repo.requests import RequestsRepo


async def sell(request: Request):
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

    try:
        transaction_id = int(data["transaction_id"])
    except (KeyError, ValueError):
        return json_response({"ok": False, "err": "Invalid transaction ID"}, status=400)

    async with session_pool() as session:
        repo = RequestsRepo(session)

        transaction = await repo.crypto_transactions.get_user_transaction(
            user_id, transaction_id
        )
        if not transaction:
            return json_response(
                {
                    "ok": False,
                    "err": "Transaction not found or doesn't belong to the user",
                },
                status=404,
            )
        if transaction.close_date is not None:
            return json_response(
                {"ok": False, "err": "Transaction already sold"}, status=400
            )

        redis = request.app["redis"]
        config = request.app["config"]

        try:
            current_price = await get_coin_price(redis, config, transaction.coin_id)
        except Exception as e:
            logging.error(f"Failed to get {transaction.coin_id} price: {str(e)}")
            return json_response(
                {"ok": False, "err": f"Failed to get {transaction.coin_id} price"},
                status=500,
            )

        # Close the transaction and calculate profit
        closed_transaction = await repo.crypto_transactions.close_user_transaction(
            user_id, transaction_id, current_price
        )

        # Update user balance
        current_balance = await get_user_balance(user_id, repo)
        new_balance = int(
            current_balance
            + closed_transaction.points_spent
            + closed_transaction.profit
        )
        await update_user_balance(user_id, new_balance, repo)

        return json_response(
            {
                "ok": True,
                "message": f"Successfully sold {closed_transaction.amount:.8f} {closed_transaction.coin_id}",
                "profit": closed_transaction.profit,
                "new_balance": new_balance,
            }
        )
