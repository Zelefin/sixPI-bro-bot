from aiogram import F
from aiogram.filters import BaseFilter
from aiogram.types import Message

from bot.config_reader import Config


class ChatFilter(BaseFilter):

    async def __call__(self, obj: Message, config: Config) -> bool:
        return F.chat.id.in_({config.chat.prod, config.chat.debug})
