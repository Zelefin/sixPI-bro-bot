import json
import logging
from math import log
from pathlib import Path
import random
import aiohttp_cors
from aiohttp import web
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_response import json_response
from aiohttp.web_request import Request
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from redis.asyncio.client import Redis
from datetime import datetime, timedelta
import pytz

from infrastructure.api.common_routes import get_user_balance, update_user_balance
from infrastructure.api.utils import parse_init_data, validate_telegram_data
from infrastructure.database.repo.requests import RequestsRepo
from infrastructure.api.words import answers, other_words


win_amounts = {
    1: 500,
    2: 100,
    3: 50,
    4: 25,
    5: 10,
    6: 5,
}


# Function to get the time remaining until midnight in Kyiv
def get_seconds_until_midnight_kyiv() -> int:
    kyiv_tz = pytz.timezone("Europe/Kiev")
    now = datetime.now(kyiv_tz)
    midnight = (now + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return int((midnight - now).total_seconds())


async def get_secret_word(redis: Redis) -> str:
    """
    Get or set the secret word for the day, with expiration at midnight Kyiv time.
    """
    if secret_word := await redis.get("secret_word"):
        return secret_word.decode("utf-8")
    else:
        random_word = random.choice(answers)
        seconds_until_midnight = get_seconds_until_midnight_kyiv()
        await redis.set(
            name="secret_word", value=random_word, ex=seconds_until_midnight
        )
        return random_word


async def get_user_attempts(redis: Redis, user_id: int) -> int:
    """
    Get the number of attempts made by a user for the current day.
    """
    key = f"user_attempts:{user_id}"
    attempts = await redis.get(key)
    return int(attempts) if attempts else 0


async def add_user_attempt(redis: Redis, user_id: int, amount: int = 1) -> None:
    """
    Increment the user's attempt count for the current day.
    """
    key = f"user_attempts:{user_id}"
    seconds_until_midnight = get_seconds_until_midnight_kyiv()

    # Use pipeline to ensure atomicity of operations
    async with redis.pipeline(transaction=True) as pipe:
        await pipe.incr(key, amount)
        await pipe.expire(key, seconds_until_midnight)
        await pipe.execute()


async def update_leaderboard(
    redis: Redis, full_name: str, guesses: int, coins_earned: int
) -> None:
    """
    Update the leaderboard in Redis with the user's name, number of guesses, and coins earned.
    """
    leaderboard_key = "wordle_leaderboard"
    expiry_time = get_seconds_until_midnight_kyiv()

    # Use a Redis hash to store user data
    user_key = f"wordle_user:{full_name}"
    await redis.hset(
        user_key,
        mapping={
            "guesses": guesses,
            "coins_earned": coins_earned,
            "timestamp": datetime.now().timestamp(),
        },
    )
    await redis.expire(user_key, expiry_time)

    # Use a Redis sorted set for ranking
    score = float(f"{guesses}.{int(datetime.now().timestamp())}")
    await redis.zadd(leaderboard_key, {full_name: score})
    await redis.expire(leaderboard_key, expiry_time)


async def get_leaderboard(redis: Redis) -> list:
    """
    Retrieve the leaderboard from Redis.
    """
    leaderboard_key = "wordle_leaderboard"
    leaderboard_data = await redis.zrange(leaderboard_key, 0, -1, withscores=True)

    result = []
    for name, score in leaderboard_data:
        user_key = f"wordle_user:{name.decode('utf-8')}"
        user_data = await redis.hgetall(user_key)
        if user_data:
            result.append(
                {
                    "full_name": name.decode("utf-8"),
                    "guesses": int(user_data[b"guesses"]),
                    "coins_earned": int(user_data[b"coins_earned"]),
                }
            )

    return result


def check_word(guess_word: str, secret_word: str) -> dict:
    """
    Check the guess word against the secret word and return the result.

    Args:
    guess_word (str): The word guessed by the user.
    secret_word (str): The secret word to be guessed.

    Returns:
    dict: A dictionary containing the result of the guess.
    """
    result = {"is_correct": False, "word": ""}

    # Convert words to lowercase for case-insensitive comparison
    guess_word = guess_word.lower()
    secret_word = secret_word.lower()

    # Check if the guess is correct
    if guess_word == secret_word:
        result["is_correct"] = True
        result["word"] = "!" + "!".join(guess_word)
        return result

    # Check each letter in the guess word
    for i, letter in enumerate(guess_word):
        if letter == secret_word[i]:
            result["word"] += "!" + letter  # correct
        elif letter in secret_word:
            result["word"] += "?" + letter  # misplaced
        else:
            result["word"] += "." + letter  # wrong

    return result


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/wordle-app/dist/index.html"
    )


async def get_win_amounts(request: Request):
    return json_response({"win_amounts": [i for _, i in win_amounts.items()]})


async def guess(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    bot = request.app["bot"]
    config = request.app["config"]
    redis: Redis = request.app["redis"]
    session_pool = request.app["session_pool"]
    task_manager = request.app["task_manager"]

    telegram_data = parse_init_data(data.get("_auth"))
    user = json.loads(telegram_data.get("user"))
    user_id = int(user.get("id"))
    if (user_attempts := await get_user_attempts(redis, user_id)) > 5:
        return json_response({"ok": False, "err": "Too many attempts"})

    guess_word: str | None = data.get("word")

    if not guess_word:
        return json_response({"ok": False, "err": "Word is not provided"})

    if type(guess_word) != str:
        return json_response({"ok": False, "err": "Word is not a string"})

    if len(guess_word) != 5:
        return json_response({"ok": False, "err": "Word length isn't 5"})

    if guess_word.lower() not in other_words:
        return json_response(
            {
                "ok": True,
                "is_correct": False,
                "is_common": False,
                "word": "",
            }
        )

    secret_word = await get_secret_word(redis)
    logging.info(secret_word)
    result = check_word(guess_word, secret_word)

    if result["is_correct"] is True:
        # If user guessed correctly before their attempts run out (a.k.a attempts > 5) we should increase
        # the number of attempts so user can't send requests no more.
        # 5 - covers all posible attempts, including when the user guessed correctly on the first time
        # Although it tempting to place 6 here, remember that we add +1 later in this code (right after this block)
        await add_user_attempt(redis, user_id, 5)
        async with session_pool() as session:
            repo = RequestsRepo(session)
            # "user_attempts" contains (already) outdated number of attempts that we've got from get_user_attempts.
            # Since we ain't overriding it with new func call, it save to calculate win amount with it
            # and +1 since user_attempts starts from 0
            adjusted_user_attempts = user_attempts + 1
            win_amount = win_amounts[adjusted_user_attempts]
            current_balance = await get_user_balance(user_id, repo)
            new_balance = current_balance + win_amount
            await update_user_balance(user_id, new_balance, repo)

        first_name = user.get("first_name")
        last_name = user.get("last_name")
        full_name = f"{first_name} {last_name}" if last_name else first_name
        await update_leaderboard(redis, full_name, adjusted_user_attempts, win_amount)

        try:
            first_name = user.get("first_name")
            last_name = user.get("last_name")
            full_name = f"{first_name} {last_name}" if last_name else first_name
            name_with_mention = f'<a href="tg://user?id={user_id}">{full_name}</a>'

            success_message = f"Користувач {name_with_mention} розгадав щоденне вордлі з {adjusted_user_attempts} спроби і отримав {win_amount} рейтингу, тепер у нього {new_balance} рейтингу.\nВітаємо!🥳"

            if (await bot.get_my_name()).name == "Just Curious":
                chat_id = config.chat.debug
                url = "https://t.me/emmm_my_bot/wordle"
            else:
                chat_id = config.chat.prod
                url = "https://t.me/SixPiBro_bot/wordle"

            await task_manager.run_task(
                task_manager.send_and_delete_message,
                bot=bot,
                chat_id=chat_id,
                text=success_message
                + f"\n<i>(повідомлення самознищиться через 20 секунд)</i>",
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="💡 Зіграти теж",
                                url=url,
                            )
                        ]
                    ]
                ),
                delete_delay=20.0,
            )
        except Exception as e:
            logging.error(f"Error sending message: {e}")

    await add_user_attempt(redis, user_id)

    return json_response(
        {
            "ok": True,
            "is_correct": result["is_correct"],
            "is_common": True,
            "word": result["word"],
            "correct_word": secret_word if ((user_attempts + 1) == 6) else "",
        }
    )


async def leaderboard_handler(request: Request):
    """
    Handle GET requests for the leaderboard.
    """
    redis: Redis = request.app["redis"]
    leaderboard = await get_leaderboard(redis)
    return json_response({"users": leaderboard})


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
    app.router.add_get("/amounts", get_win_amounts)
    app.router.add_get("/leaderboard", leaderboard_handler)
    app.router.add_post("/guess", guess)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/wordle-app/dist/assets",
    )

    for route in list(app.router.routes()):
        cors.add(route)
