import json
import logging
import re
from aiohttp.web_response import json_response
from aiohttp.web_request import Request

from infrastructure.api.common_routes import check_rate_limit
from infrastructure.api.crypto_exchange_api.utils import get_coin_info
from infrastructure.api.utils import parse_init_data, validate_telegram_data


async def get_basic_coins(request: Request):
    redis = request.app["redis"]
    config = request.app["config"]

    popular_coins_ids = [1, 1027, 1839, 5426, 52, 11419, 2010]

    try:
        return json_response(
            {
                "ok": True,
                "coins_infos": [
                    await get_coin_info(redis, config, coin_id=coin_id)
                    for coin_id in popular_coins_ids
                ],
            }
        )
    except Exception as e:
        logging.error(f"Failed to get basic coins: {e}")
        return json_response(
            {"ok": False, "err": "Failed to get basic coins"}, status=500
        )


async def search(request: Request):
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

    try:
        coin_symbol = re.sub(r"[^A-Z0-9]", "", str(data["coin_symbol"]).upper())
    except KeyError:
        return json_response({"ok": False, "err": "Missing coin symbol"}, status=400)

    redis = request.app["redis"]
    config = request.app["config"]

    try:
        return json_response(
            {
                "ok": True,
                "coins_info": await get_coin_info(redis, config, symbol=coin_symbol),
            }
        )
    except Exception as e:
        logging.error(f"Failed to get {coin_symbol} info: {e}")
        return json_response(
            {"ok": False, "err": f"Failed to get {coin_symbol} info"}, status=500
        )
