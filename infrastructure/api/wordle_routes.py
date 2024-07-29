import json
import logging
from math import log
from pathlib import Path
import aiohttp_cors
from aiohttp import web
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_response import json_response
from aiohttp.web_request import Request
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from infrastructure.api.common_routes import get_user_balance, update_user_balance
from infrastructure.api.utils import parse_init_data, validate_telegram_data
from infrastructure.database.repo.requests import RequestsRepo


async def get_secret_word() -> str:
    return "ЛИСТЯ"


async def get_common_words() -> list[str]:
    return ["ЛИСТЯ", "ДИМАР", "КЕФІР", "ОСІНЬ", "ВЕСНА", "ЦУЦИК"]


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/wordle-app/dist/index.html"
    )


def check_word(guess_word: str, secret_word: str) -> dict:
    """
    Check the guess word against the secret word and return the result.

    Args:
    guess_word (str): The word guessed by the user.
    secret_word (str): The secret word to be guessed.

    Returns:
    dict: A dictionary containing the result of the guess.
    """
    result = {
        "correct_letters": [],
        "misplaced_letters": [],
        "incorrect_letters": [],
        "is_correct": False,
    }

    # Convert words to uppercase for case-insensitive comparison
    guess_word = guess_word.upper()
    secret_word = secret_word.upper()

    # Check if the guess is correct
    if guess_word == secret_word:
        result["is_correct"] = True
        result["correct_letters"] = list(guess_word)
        return result

    # Check each letter in the guess word
    for i, letter in enumerate(guess_word):
        if letter == secret_word[i]:
            result["correct_letters"].append((i, letter))
        elif letter in secret_word:
            result["misplaced_letters"].append((i, letter))
        else:
            result["incorrect_letters"].append((i, letter))

    return result


async def guess(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    session_pool = request.app["session_pool"]
    bot = request.app["bot"]
    config = request.app["config"]

    guess_word: str | None = data.get("word")
    telegram_data = parse_init_data(data.get("_auth"))
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    if not guess_word:
        return json_response({"ok": False, "err": "Word is not provided"})

    if type(guess_word) != str:
        return json_response({"ok": False, "err": "Word is not a string"})

    if len(guess_word) != 5:
        return json_response({"ok": False, "err": "Word length isn't 5"})

    common_words = await get_common_words()
    if guess_word.upper() not in common_words:
        return json_response(
            {
                "ok": True,
                "is_common": False,
                "correct_letters": [],
                "misplaced_letters": [],
                "incorrect_letters": [],
                "is_correct": False,
            }
        )

    secret_word = await get_secret_word()
    result = check_word(guess_word, secret_word)

    if result["is_correct"] is True:
        async with session_pool() as session:
            repo = RequestsRepo(session)
            win_amount = 10
            current_balance = await get_user_balance(user_id, repo)
            new_balance = current_balance + win_amount
            await update_user_balance(user_id, new_balance, repo)
        try:
            first_name = user.get("first_name")
            last_name = user.get("last_name")
            full_name = f"{first_name} {last_name}" if last_name else first_name
            name_with_mention = f'<a href="tg://user?id={user_id}">{full_name}</a>'

            success_message = f"Користувач {name_with_mention} розв'язав щоденне вордлі і отримав {win_amount} рейтингу, тепер у нього {new_balance} рейтингу.\nВітаємо!🥳"

            if (await bot.get_my_name()).name == "Just Curious":
                chat_id = config.chat.debug
                url = "https://t.me/emmm_my_bot/wordle"
            else:
                chat_id = config.chat.prod
                url = "https://t.me/SixPiBro_bot/wordle"

            await bot.send_message(
                chat_id=chat_id,
                text=success_message,
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="Зіграти у Вордлі 💡",
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
            "ok": True,
            "is_common": True,
            "correct_letters": result["correct_letters"],
            "misplaced_letters": result["misplaced_letters"],
            "incorrect_letters": result["incorrect_letters"],
            "is_correct": result["is_correct"],
        }
    )


def setup_wordle_routes(app: web.Application):
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True, expose_headers="*", allow_headers="*"
            )
        },
    )
    app.router.add_get("", index_handler)
    app.router.add_post("/guess", guess)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/wordle-app/dist/assets",
    )

    for route in list(app.router.routes()):
        cors.add(route)
