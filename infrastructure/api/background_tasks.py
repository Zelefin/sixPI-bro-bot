import asyncio
from typing import Callable, Any
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup


class BackgroundTaskManager:
    def __init__(self):
        self.tasks = set()

    async def run_task(self, func: Callable, *args: Any, **kwargs: Any):
        task = asyncio.create_task(func(*args, **kwargs))
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)

    async def send_and_delete_message(
        self,
        bot: Bot,
        chat_id: int,
        text: str,
        parse_mode: str = None,
        reply_markup: InlineKeyboardMarkup = None,
        send_delay: float = 0.0,
        delete_delay: float = 5.0,
    ):
        try:
            await asyncio.sleep(send_delay)
            sent_message = await bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode=parse_mode,
                reply_markup=reply_markup,
            )
            await asyncio.sleep(delete_delay)
            await bot.delete_message(
                chat_id=chat_id, message_id=sent_message.message_id
            )
        except Exception as e:
            print(f"Error in send_and_delete_message: {e}")
