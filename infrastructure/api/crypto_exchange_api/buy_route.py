import json
import logging
from aiohttp.web_response import json_response
from aiohttp.web_request import Request

from infrastructure.api.common_routes import (
    get_user_balance,
    update_user_balance,
    check_rate_limit,
)
from infrastructure.api.crypto_exchange_api.utils import get_coin_info
from infrastructure.api.utils import parse_init_data, validate_telegram_data
from infrastructure.database.repo.requests import RequestsRepo


async def buy(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(data["_auth"])
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    if not user_id:
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()

    if check_rate_limit(user_id):
        return json_response({"ok": False, "err": "Rate limit exceeded"}, status=429)

    session_pool = request.app["session_pool"]

    try:
        points_to_spend = abs(int(data["points"]))
        if points_to_spend == 0:
            return json_response(
                {"ok": False, "err": "Invalid points amount"}, status=400
            )
    except (KeyError, ValueError):
        return json_response({"ok": False, "err": "Invalid points amount"}, status=400)

    try:
        coin_id = int(data["coin_id"])
    except (KeyError, ValueError):
        return json_response(
            {"ok": False, "err": "Unexpected type of coin id"}, status=400
        )

    redis = request.app["redis"]
    config = request.app["config"]

    try:
        coin_info = await get_coin_info(redis, config, coin_id=coin_id)
    except Exception as e:
        logging.error(f"Failed to get {coin_id} price: {str(e)}")
        return json_response(
            {"ok": False, "err": f"Failed to get {coin_id} price"},
            status=500,
        )

    coin_price = coin_info["price"]
    coin_symbol = coin_info["simbol"]

    amount = points_to_spend / coin_price

    async with session_pool() as session:
        repo = RequestsRepo(session)
        current_balance = await get_user_balance(user_id, repo)

        if current_balance < points_to_spend:
            return json_response(
                {"ok": False, "err": "Insufficient balance"}, status=400
            )

        # Process the purchase
        new_balance = current_balance - points_to_spend
        await update_user_balance(user_id, new_balance, repo)

        # Record the transaction
        await repo.crypto_transactions.add_user_transaction(
            user_id,
            full_name,
            coin_id,
            coin_symbol,
            amount,
            points_to_spend,
            coin_price,
        )

        return json_response(
            {
                "ok": True,
                "message": f"Successfully purchased {amount:.8f} {coin_symbol}",
                "points_spent": points_to_spend,
                "new_balance": new_balance,
            }
        )
