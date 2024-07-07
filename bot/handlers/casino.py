from aiogram import Router, types, Bot
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

casino_router = Router()

HOURS = 60 * 60


@casino_router.message(Command("casino"))
async def casino_command(
    message: types.Message,
    bot: Bot,
):
    await message.reply(
        text="Казино доступно тут: ",
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
