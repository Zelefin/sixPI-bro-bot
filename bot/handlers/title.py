import asyncio
import logging
import re

from aiogram import Bot, F, Router, types
from aiogram.filters import Command

from infrastructure.database.repo.requests import RequestsRepo
from bot.filters.rating import RatingFilter


title_router = Router()


@title_router.message(
    Command("title", prefix="/!", magic=F.args.len() > 0),
    F.reply_to_message.from_user.as_("member"),
    RatingFilter(rating=300),
)
@title_router.message(
    Command("title", prefix="/!", magic=F.args.len() > 0),
    ~F.reply_to_message,
    F.from_user.as_("member_self"),
    RatingFilter(rating=100),
)
async def promote_with_title(
    message: types.Message,
    bot: Bot,
    repo: RequestsRepo,
    member: types.User | None = None,
    member_self: types.User | None = None,
    rating: int | None = None,
    is_admin: bool | None = None,
):
    if member_self:
        member = member_self
        admin = await bot.me()

    elif member:
        admin = message.from_user
        target_rating = await repo.rating_users.get_rating_by_user_id(member.id) or 0

        if rating and not is_admin:
            if rating > 1000:
                LIMIT_TARGET_RATING = 600
            elif rating > 300:
                LIMIT_TARGET_RATING = 100

            else:
                raise ValueError("Неправильний рейтинг для цієї команди")
        elif is_admin:
            LIMIT_TARGET_RATING = 100000
        else:
            LIMIT_TARGET_RATING = 100

        if target_rating > LIMIT_TARGET_RATING:
            return await message.answer(
                f"Користувач має рейтинг більше {LIMIT_TARGET_RATING}, і має імунітет від цієї команди"
            )

    else:
        admin = message.from_user

    admin_username = admin.username
    admin_mentioned = admin.mention_html()

    member_id = member.id
    member_username = member.username
    member_mentioned = member.mention_html()

    command_parse = re.compile(r"(!title|/title)(@\S+)?( [\w+\D]+)?")
    parsed = command_parse.match(message.text)
    logging.info(parsed.groups())
    custom_title = parsed.group(3)[:16]

    try:
        chat_member = await message.chat.get_member(member_id)
        if chat_member.status in {"administrator", "creator"}:
            text = (
                f"Користувачу {member_mentioned} було змінено посаду на {custom_title}"
                f" адміністратором {admin_mentioned}"
            )
            await message.chat.set_administrator_custom_title(
                user_id=member_id, custom_title=custom_title
            )
        else:
            text = (
                f"Користувач {member_mentioned} був підвищений до адміністратора адміністратором"
                f" {admin_mentioned} з посадою: {custom_title}"
            )
            await message.chat.promote(
                user_id=member_id,
            )
            await message.chat.set_administrator_custom_title(
                user_id=member_id, custom_title=custom_title
            )
        await message.answer(text)
        logging.info(
            f"Користувач @{member_username} був підвищений до адміністратора адміном @{admin_username}"
        )
    except Exception as e:
        logging.exception(e)
        await message.answer(
            f"Відбулася помилка під час підвищення користувача {member_mentioned} до адміністратора: {e}"
        )
        logging.info(f"Бот не зміг підвищити користувача @{member_username}")

        service_message = await message.reply(
            "Повідомлення самознищиться через 5 секунд."
        )
        await asyncio.sleep(5)
        await message.delete()
        await service_message.delete()


@title_router.message(
    Command("title", prefix="/!"),
    ~F.reply_to_message,
    F.from_user.as_("member_self"),
    ~RatingFilter(rating=100),
)
async def not_enough_rating(message: types.Message):
    await message.answer("У вас недостатньо рейтингу для використання цієї команди.")
