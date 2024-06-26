from aiogram import Bot, types
from aiogram.types import BotCommand


async def set_default_commands(bot: Bot):
    commands_members = {
        "honor": "Дізнатися % академічної доброчесності користувача",
        "biba": "Дізнатися скільки см у користувача біба",
        "nation": "Дізнатися національність користувача",
        "top": "Дізнатися топ користувачів",
        "rating": "Дізнатися рейтинг користувача",
        "casino": "Зіграти в казино",
        "ai": "ШІ відповідь",
        "title": "Встановити титул",
        "all": "Кликати всіх",
    }

    commands_admins = {
        "provider": "Змінити AI провайдера",
        "cunning": "Увімкнути хитрого ШІ",
        "good": "Увімкнути доброго ШІ",
        "nasty": "Увімкнути поганого ШІ",
        **commands_members,
    }

    await bot.set_my_commands(
        [
            BotCommand(command=name, description=value)
            for name, value in commands_members.items()
        ],
        scope=types.BotCommandScopeAllGroupChats(),
    )
    await bot.set_my_commands(
        [
            BotCommand(command=name, description=value)
            for name, value in commands_admins.items()
        ],
        scope=types.BotCommandScopeAllChatAdministrators(),
    )
