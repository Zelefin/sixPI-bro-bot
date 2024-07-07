import json
import logging
import random
from pathlib import Path

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request
from aiohttp.web_response import json_response

from infrastructure.api.utils import validate_telegram_data, parse_init_data
from infrastructure.database.repo.requests import RequestsRepo


async def get_user_balance(user_id: int, repo: RequestsRepo) -> int:
    return await repo.rating_users.get_rating_by_user_id(user_id) or 0


async def update_user_balance(
    user_id: int, new_balance: int, repo: RequestsRepo
) -> None:
    await repo.rating_users.update_rating_by_user_id(user_id, new_balance)


# Game logic
SYMBOLS = ["🍋", "🍒", "🍇", "🎰", "7️⃣"]
WEIGHTS = [70, 55, 50, 10, 3]


def get_random_symbol():
    return random.choices(SYMBOLS, weights=WEIGHTS, k=1)[0]


def calculate_winnings(result: list[str], stake: int) -> int:
    if len(set(result)) == 1:  # All symbols are the same
        symbol = result[0]

        multiplier = {
            "7️⃣": 1500,
            "🎰": 500,
            "🍇": 18,
            "🍒": 12,
            "🍋": 4,
        }.get(symbol, 0)
        return stake * multiplier
    return 0


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/casino-app/dist/index.html"
    )


async def get_balance(request: Request):

    user_id: str | None = request.rel_url.query.get("user_id")
    if not user_id:
        return json_response({"balance": 0})
    session_pool = request.app["session_pool"]
    async with session_pool() as session:
        repo = RequestsRepo(session)
        balance = await get_user_balance(int(user_id), repo)
    return json_response({"balance": balance})


async def spin(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data["_auth"]):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    session_pool = request.app["session_pool"]
    bot = request.app["bot"]
    config = request.app["config"]

    stake = int(data["stake"]) if data.get("stake") else 1
    telegram_data = parse_init_data(data["_auth"])

    user = telegram_data.get("user")
    user = json.loads(user)
    user_id = user.get("id")

    async with session_pool() as session:
        repo = RequestsRepo(session)
        current_balance = await get_user_balance(user_id, repo)

        if current_balance < stake:
            return json_response(
                {"ok": False, "err": "Insufficient balance"}, status=400
            )

        result = [get_random_symbol() for _ in range(3)]
        win_amount = calculate_winnings(result, stake)
        new_balance = current_balance - stake + win_amount
        action = "win" if win_amount > 0 else "lose"

        await update_user_balance(user_id, new_balance, repo)

        if action == "win" and "🍋" not in result and "🍒" not in result:
            try:
                first_name = user.get("first_name")
                last_name = user.get("last_name")
                full_name = f"{first_name} {last_name}" if last_name else first_name
                name_with_mention = f'<a href="tg://user?id={user_id}">{full_name}</a>'
                prize = " ".join(result)
                success_message = f"Користувач {name_with_mention} вибив {prize} і отримав {win_amount} рейтингу, тепер у нього {new_balance} рейтингу.\nВітаємо!"

                if (await bot.get_my_name()).name == "Just Curious":
                    chat_id = config.chat.debug
                    url = "https://t.me/emmm_my_bot/casino"
                else:
                    chat_id = config.chat.prod
                    url = "https://t.me/SixPiBro_bot/casino"

                await bot.send_message(
                    chat_id=chat_id,
                    text=success_message,
                    parse_mode="HTML",
                    reply_markup=InlineKeyboardMarkup(
                        inline_keyboard=[
                            [
                                InlineKeyboardButton(
                                    text="🎰 Зіграти теж!",
                                    url=url,
                                )
                            ]
                        ]
                    ),
                )
            except Exception as e:
                logging.error(f"Error sending message: {e}")

    return json_response(
        {
            "result": result,
            "action": action,
            "winAmount": win_amount,
            "newBalance": new_balance,
        }
    )
