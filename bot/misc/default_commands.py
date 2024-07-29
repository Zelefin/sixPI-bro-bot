from aiogram import Bot, types
from aiogram.types import BotCommand


async def set_default_commands(bot: Bot):
    commands_members = {
        "ai": "ШІ відповідь",
        "rating": "Дізнатися рейтинг користувача",
        "top": "Дізнатися топ користувачів",
        "casino": "Зіграти в казино",
        "honor": "(AI*) Дізнатися % академічної доброчесності користувача",
        "taro": "(AI*) Дізнатися прогноз Таро",
        "nation": "(AI*) Дізнатися національність користувача",
        "biba": "Дізнатися скільки см у користувача біба",
        # "poker": "Зіграти в покер",
        "title": "Встановити титул",
        "all": "Кликати всіх",
    }

    commands_admins = {
        "provider_anthropic": "Змінити AI на Anthropic",
        "provider_openai": "Змінити AI на OpenAI",
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
