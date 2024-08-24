import asyncio
from aiogram import Router, Bot
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message

web_apps_router = Router()


@web_apps_router.message(Command("casino"))
async def casino_command(message: Message, bot: Bot):
    bot_msg = await message.reply(
        text="Казино доступно тут:\n<i>(повідомлення самознищаться через 5 секунд)</i>",
        disable_web_page_preview=False,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🎰 Зіграти!",
                        url=(
                            "https://t.me/emmm_my_bot/casino"
                            if (await bot.get_my_name()).name == "Just Curious"
                            else "https://t.me/SixPiBro_bot/casino"
                        ),
                    )
                ]
            ]
        ),
    )
    await asyncio.sleep(5)

    await bot.delete_messages(
        chat_id=message.chat.id, message_ids=[bot_msg.message_id, message.message_id]
    )


@web_apps_router.message(Command("wordle"))
async def poker_command(message: Message, bot: Bot):
    bot_msg = await message.reply(
        text="Щоденне Вордлі доступно тут:\n<i>(повідомлення самознищаться через 5 секунд)</i>",
        disable_web_page_preview=False,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🔠 Зіграти",
                        url=(
                            "https://t.me/emmm_my_bot/wordle"
                            if (await bot.get_my_name()).name == "Just Curious"
                            else "https://t.me/SixPiBro_bot/wordle"
                        ),
                    )
                ]
            ]
        ),
    )
    await asyncio.sleep(5)

    await bot.delete_messages(
        chat_id=message.chat.id, message_ids=[bot_msg.message_id, message.message_id]
    )


@web_apps_router.message(Command("market"))
async def poker_command(message: Message, bot: Bot):
    bot_msg = await message.reply(
        text="Криптовалютна біржа доступна тут:\n<i>(повідомлення самознищаться через 5 секунд)</i>",
        disable_web_page_preview=False,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="💸 Біржа",
                        url=(
                            "https://t.me/emmm_my_bot/crypto_exchange"
                            if (await bot.get_my_name()).name == "Just Curious"
                            else "https://t.me/SixPiBro_bot/crypto_exchange"
                        ),
                    )
                ]
            ]
        ),
    )
    await asyncio.sleep(5)

    await bot.delete_messages(
        chat_id=message.chat.id, message_ids=[bot_msg.message_id, message.message_id]
    )
