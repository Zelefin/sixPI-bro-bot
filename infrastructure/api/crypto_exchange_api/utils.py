import json
from aiohttp import ClientSession

from bot.config_reader import Config
from redis.asyncio.client import Redis


async def get_coin_info(
    redis: Redis, config: Config, coin_id: int | None = None, symbol: str | None = None
) -> dict | list[dict]:
    """
    Provide only coin_id or symbol, not both.

    params:
    redis: Redis connection
    config: Configuration object
    coin_id: int
    symbol: str

    returns only one coin info if coin_id provided else one or more coins info: id, name, symbol, price, change24h
    """
    if not coin_id and not symbol:
        return {}

    # Create a cache key based on the input
    cache_key = f"coin_info:{coin_id or symbol}"

    # Try to get data from cache
    cached_data = await redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    # If not in cache, fetch from API
    async with ClientSession() as session:
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
        parameters = {"id": coin_id} if coin_id else {"symbol": symbol}
        headers = {
            "Accepts": "application/json",
            "X-CMC_PRO_API_KEY": config.coinmarketcap.api_key,
        }
        async with session.get(url, headers=headers, params=parameters) as resp:
            json_resp = await resp.json()

            if coin_id:
                coin = json_resp["data"][str(coin_id)]
                result = {
                    "id": coin["id"],
                    "name": coin["name"],
                    "symbol": coin["symbol"],
                    "price": coin["quote"]["USD"]["price"],
                    "change24h": coin["quote"]["USD"]["percent_change_24h"],
                }
            else:
                result = []
                for coin in json_resp["data"][symbol]:
                    result.append(
                        {
                            "id": coin["id"],
                            "name": coin["name"],
                            "symbol": coin["symbol"],
                            "price": coin["quote"]["USD"]["price"],
                            "change24h": coin["quote"]["USD"]["percent_change_24h"],
                        }
                    )

    # Cache the result
    await redis.setex(cache_key, 300, json.dumps(result))

    return result


async def get_coin_price(redis: Redis, config: Config, coin_id: int) -> float:
    # `get_coin_info` will always return a dict, since we providing coin_id
    return (await get_coin_info(redis, config, coin_id=coin_id))["price"]


# Helper function to format transaction data
async def format_transaction(redis: Redis, config: Config, t):
    transaction_data = {
        "id": t.id,
        "full_name": t.full_name,
        "coin_id": t.coin_id,
        "coin_symbol": t.coin_symbol,
        "amount": t.amount,
        "points_spent": t.points_spent,
        "buy_price": t.buy_price,
        "sell_price": t.sell_price,
        "profit": t.profit,
        "open_date": t.open_date.isoformat(),
        "close_date": t.close_date.isoformat() if t.close_date else None,
    }

    if t.sell_price is None:
        current_price = await get_coin_price(redis, config, t.coin_id)
        transaction_data["estimated_sell_price"] = current_price
        transaction_data["estimated_profit"] = (current_price - t.buy_price) * t.amount
    else:
        transaction_data["estimated_sell_price"] = None
        transaction_data["estimated_profit"] = None

    return transaction_data
