import logging
from collections import defaultdict

from aiogram import Bot, F, Router, flags, types
from aiogram.filters import Command, or_f, CommandObject
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.base import StorageKey
from aiogram.exceptions import TelegramBadRequest
from cachetools import TTLCache

from bot.filters.admin import AdminFilter
from infrastructure.database.repo.requests import RequestsRepo
from bot.filters.rating import RatingFilter
from bot.handlers.web_apps import HOURS
from bot.middlewares.ratings_cache import RatingCacheReactionMiddleware
from bot.services.rating import (
    NEGATIVE_EMOJIS,
    POSITIVE_EMOJIS,
    reaction_rating_calculator,
    change_rating,
    UserRank,
)
from bot.services.cache_profiles import get_profile_cached

rating_router = Router()
rating_router.message_reaction.middleware(RatingCacheReactionMiddleware())

cache = TTLCache(maxsize=10, ttl=60 * 60 * 24 * 7)


async def process_new_rating(
    rating_change: int,
    repo: RequestsRepo,
    helper_id: int,
    mention_from: str,
    mention_reply: str,
) -> tuple[int, str] | None:
    previous_rating, new_rating = await change_rating(helper_id, rating_change, repo)

    if rating_change > 0:
        text = (
            f"{mention_from} <b>підвищив рейтинг на {rating_change} користувачу</b> {mention_reply} 😳 \n"
            f"<b>Поточний рейтинг: {new_rating}</b>"
        )
    else:
        text = (
            f"{mention_from} <b>знизив рейтинг на {-rating_change} користувачу</b> {mention_reply} 😳 \n"
            f"<b>Поточний рейтинг: {new_rating}</b>"
        )
    logging.info(text)

    milestones = [50, 100, 300, 600, 1000]
    for milestone in milestones:
        if previous_rating < milestone <= new_rating:
            if milestone == 1000:
                return new_rating, "👑 Король"
            elif milestone == 600:
                return new_rating, "🧙‍♂️ Чаклун"
            elif milestone == 300:
                return new_rating, "🦄 Гетьман"
            elif milestone == 100:
                return new_rating, "🐘 Отаман"
            elif milestone == 50:
                return new_rating, "🐥 Козак"


# @flags.override(user_id=845597372)
@rating_router.message(Command("top"))
@flags.rate_limit(limit=0.5 * HOURS, key="top", chat=True)
async def get_top(m: types.Message, repo: RequestsRepo, bot, state: FSMContext):
    history_key = StorageKey(bot_id=bot.id, user_id=m.chat.id, chat_id=m.chat.id)
    state_data = await state.storage.get_data(key=history_key)
    previous_helpers = state_data.get("top", {})

    current_helpers = await repo.rating_users.get_top_by_rating(50)
    current_helpers_dict = {user_id: rating for user_id, rating in current_helpers}

    rank_groups = defaultdict(list)

    for user_id, rating in current_helpers:
        profile = await get_profile_cached(state.storage, m.chat.id, user_id, bot)
        if not profile:
            continue

        previous_rating = previous_helpers.get(str(user_id), rating)
        change = rating - previous_rating
        change = (
            f"⬆️ {change}" if change > 0 else f"🔻 {abs(change)}" if change < 0 else ""
        )
        helper_entry = (rating, change, profile)
        # Categorize helpers into leagues based on rating
        user_rank = UserRank.from_rating(rating)
        rank_groups[user_rank].append(helper_entry)

    kings = rank_groups[UserRank.KING]
    sorcerers = rank_groups[UserRank.SORCERER]
    hetmans = rank_groups[UserRank.HETMAN]
    otamans = rank_groups[UserRank.OTAMAN]
    cossacs = rank_groups[UserRank.COSSACK]
    pig_herder = rank_groups[UserRank.PIG_HERDER][:10]  # only 10

    await state.storage.update_data(key=history_key, data={"top": current_helpers_dict})

    def format_league(league, league_name, emoji):
        if not league:
            return ""

        formatted_entries = "\n".join(
            [
                f"<b>{number}) {emoji} " f"{profile} ( {rating} ) {change}</b>"
                for number, (rating, change, profile) in enumerate(league, 1)
            ]
        )
        return f"<b>{league_name}:</b>\n{formatted_entries}"

    text = "\n\n".join(
        [
            format_league(kings, "Королі", "👑"),
            format_league(sorcerers, "Чаклуни", "🧙‍♂️"),
            format_league(hetmans, "Гетьмани", "🦄"),
            format_league(otamans, "Отамани", "🐘"),
            format_league(cossacs, "Козаки", "🐥"),
            format_league(pig_herder, "Свинопаси", "👩‍🌾"),
        ]
    )

    text += """
<b>Права юзерів:</b>
- <b>👑Королі</b> можуть встановлювати титул собі і всім нижче чаклунів.
- <b>🧙‍♂️Чаклуни</b> просто крутіші за гетьманів.
- <b>🦄Гетьмани</b> можуть змінювати/встановлювати собі та всім хто нижче Отаманів кастомні титули.
- <b>🐘Отамани</b> можуть встановлювати кастомні титули тільки собі.
- <b>🐥Козаки</b> є доступ до моделей gpt-4o та claude-3.5-haiku.
- <b>👩‍🌾Свинопаси</b> не можуть користуватися командою /ai.

<b>Правила:</b>
- Ставте реакції на повідомлення, деякі позитивні реакції збільшують рейтинг на 10, деякі негативні зменшують на 5.
- Ви не можете змінювати рейтинг собі

<b>Виграти рейтинг можна в /casino та в щоденному /wordle</b>
"""
    await m.answer(text, disable_notification=True)


@rating_router.message_reaction(
    or_f(
        F.new_reaction[0].emoji.in_(POSITIVE_EMOJIS),
        F.old_reaction[0].emoji.in_(POSITIVE_EMOJIS),
    ),
)
@rating_router.message_reaction(
    or_f(
        F.new_reaction[0].emoji.in_(NEGATIVE_EMOJIS),
        F.old_reaction[0].emoji.in_(NEGATIVE_EMOJIS),
    ),
    RatingFilter(rating=UserRank.get_rank_range(UserRank.COSSACK).minimum),
)
async def add_reaction_rating_handler(
    reaction: types.MessageReactionUpdated,
    repo: RequestsRepo,
    bot: Bot,
    helper_id: int,
):
    rating_change = await reaction_rating_calculator(
        reaction, repo, helper_id, reaction.user.id
    )
    if not helper_id or helper_id == reaction.user.id:
        logging.info(
            f"User {reaction.user.id} tried to rate message {reaction.message_id} "
            f"but the message is not found in the database"
        )
        return
    try:
        helper = await bot.get_chat_member(reaction.chat.id, helper_id)
    except TelegramBadRequest:
        return

    upgraded = await process_new_rating(
        rating_change,
        repo,
        helper_id,
        reaction.user.mention_html(reaction.user.first_name),
        helper.user.mention_html(helper.user.first_name),
    )
    if upgraded:
        new_rating, title = upgraded
        await bot.send_message(
            reaction.chat.id,
            f"🎉 Вітаємо {helper.user.mention_html(helper.user.first_name)}! Досягнутий рівень: {title}! 🎉",
        )


@rating_router.message(Command("setrating"), AdminFilter())
async def set_user_rating(
    message: types.Message, command: CommandObject, repo: RequestsRepo
):
    if not message.reply_to_message:
        await message.reply(
            "Цю команду потрібно використовувати як відповідь на повідомлення користувача."
        )
        return

    args = command.args
    if not args:
        await message.reply("Використання: /setrating [новий_рейтинг]")
        return
    try:
        new_rating = int(args)
    except ValueError:
        await message.reply("Новий рейтинг має бути дійсним цілим числом.")
        return
    target_user = message.reply_to_message.from_user
    await repo.rating_users.update_rating_by_user_id(target_user.id, new_rating)

    new_title = determine_user_title(new_rating)

    await message.reply(
        f"Рейтинг користувача {target_user.full_name} змінено на {new_rating}.\nНове звання: {new_title}"
    )


@rating_router.message(Command("rating"))
async def get_user_rating(m: types.Message, repo: RequestsRepo, bot, state: FSMContext):
    target = m.reply_to_message.from_user if m.reply_to_message else m.from_user
    target_id = target.id

    current_rating = await repo.rating_users.get_rating_by_user_id(target_id)
    if current_rating is None:
        await m.reply("Рейтинг користувача не знайдено.")
        return

    # Assume we have a function to get the previous rating and update it
    previous_rating, _ = await get_and_update_previous_rating(
        bot, state, target_id, current_rating
    )

    # Calculate rating change
    rating_change = current_rating - previous_rating

    # Determine the user's title
    title = determine_user_title(current_rating)

    change_text = (
        f" (⬆️ {rating_change})"
        if rating_change > 0
        else f" (🔻 {abs(rating_change)})" if rating_change != 0 else ""
    )

    await m.reply(
        f"Рейтинг: {current_rating}{change_text}\n{target.full_name}: {title}"
    )


@rating_router.message(Command("wipe"), AdminFilter())
async def wipe_user_rating(m: types.Message, repo: RequestsRepo):
    await repo.rating_users.wipe_ratings()
    await m.reply("Рейтинги користувачів було очищено.")


def determine_user_title(rating):
    if rating >= UserRank.get_rank_range(UserRank.KING).minimum:
        return "👑 Король"
    elif rating >= UserRank.get_rank_range(UserRank.SORCERER).minimum:
        return "🧙‍♂️ Чаклун"
    elif rating >= UserRank.get_rank_range(UserRank.HETMAN).minimum:
        return "🦄 Гетьман"
    elif rating >= UserRank.get_rank_range(UserRank.OTAMAN).minimum:
        return "🐘 Отаман"
    elif rating >= UserRank.get_rank_range(UserRank.COSSACK).minimum:
        return "🐥 Козак"
    else:
        return "👩‍🌾 Свинопас"


async def get_and_update_previous_rating(
    bot: Bot, state: FSMContext, user_id: int, current_rating: int
):
    history_key = StorageKey(bot_id=bot.id, user_id=user_id, chat_id=user_id)
    state_data = await state.storage.get_data(key=history_key)
    previous_rating = state_data.get("previous_rating", current_rating)
    # Update the previous rating to the current one for next time
    await state.storage.update_data(
        key=history_key, data={"previous_rating": current_rating}
    )
    return previous_rating, current_rating - previous_rating
