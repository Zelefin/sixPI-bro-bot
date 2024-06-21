import asyncio
from elevenlabs.client import AsyncElevenLabs
import logging

import betterlogging as bl
from aiogram import Bot, Dispatcher, F
from aiogram.fsm.strategy import FSMStrategy
from aiogram.fsm.storage.redis import DefaultKeyBuilder, RedisStorage
from anthropic import AsyncAnthropic
import httpx
from openai import AsyncOpenAI
from pyrogram import Client

from infrastructure.database.repo.requests import Database
from infrastructure.database.setup import create_engine, create_session_pool
from bot.config_reader import Config, load_config
from bot.handlers.fun import fun_router
from bot.handlers.ai import ai_router
from bot.handlers.title import title_router
from bot.handlers.casino import casino_router
from bot.handlers.rating import rating_router

from bot.middlewares.bot_messages import BotMessages
from bot.middlewares.database import DatabaseMiddleware
from bot.middlewares.ratings_cache import MessageUserMiddleware
from bot.middlewares.throttling import ThrottlingMiddleware
from bot.misc.default_commands import set_default_commands
from bot.services import broadcaster
from aiogram.client.default import DefaultBotProperties


async def on_startup(bot: Bot, config: Config, client: Client) -> None:
    await broadcaster.broadcast(bot, [config.admin.id], "Бот був запущений")
    await set_default_commands(bot)
    await client.start()


async def shutdown(client: Client) -> None:
    await client.stop()


def register_global_middlewares(
    dp: Dispatcher,
    session_pool,
    storage,
):
    """
    Register global middlewares for the given dispatcher.
    Global middlewares here are the ones that are applied to all the handlers (you specify the type of update)

    :param dp: The dispatcher instance.
    :type dp: Dispatcher
    :param session_pool: Optional session pool object for the database using SQLAlchemy.
    :param storage: FSM storage object.
    :return: None
    """
    # middleware_types = [
    #     OpenAIModerationMiddleware(openai_client),
    # ]
    #
    # for middleware_type in middleware_types:
    #     dp.message.outer_middleware(middleware_type)
    #     dp.callback_query.outer_middleware(middleware_type)
    dp.message.middleware(ThrottlingMiddleware(storage))
    dp.message_reaction.middleware(ThrottlingMiddleware(storage))
    dp.update.outer_middleware(DatabaseMiddleware(session_pool))
    dp.message.outer_middleware(MessageUserMiddleware())


def setup_logging():
    """
    Set up logging configuration for the application.

    This method initializes the logging configuration for the application.
    It sets the log level to INFO and configures a basic colorized log for
    output. The log format includes the filename, line number, log level,
    timestamp, logger name, and log message.

    Returns:
        None

    Example usage:
        setup_logging()
    """
    log_level = logging.INFO
    bl.basic_colorized_config(level=log_level)

    logging.basicConfig(
        level=logging.INFO,
        format="%(filename)s:%(lineno)d #%(levelname)-8s [%(asctime)s] - %(name)s - %(message)s",
    )
    logger = logging.getLogger(__name__)
    logger.info("Starting bot")


async def main():
    setup_logging()

    config = load_config(".env")
    storage = RedisStorage.from_url(
            config.redis.make_connection_string(),
            key_builder=DefaultKeyBuilder(with_bot_id=True, with_destiny=True),
        )

    bot = Bot(
        token=config.bot.token, default=DefaultBotProperties(parse_mode="HTML")
    )
    engine = create_engine("main.db")
    db = Database(engine)
    client = Client(
        name="bot",
        bot_token=config.bot.token,
        api_id=config.telegram_api.id,
        api_hash=config.telegram_api.hash,
        no_updates=True,  # We don't need to handle incoming updates by client
    )
    dp = Dispatcher(storage=storage, client=client, fsm_strategy=FSMStrategy.CHAT)
    await db.create_tables()
    session_pool = create_session_pool(engine)
    ratings_cache = {}
    openai_client = AsyncOpenAI(api_key=config.openai.api_key)

    elevenlabs_client = AsyncElevenLabs(
        api_key=config.elevenlabs.api_key,
        httpx_client=httpx.AsyncClient(),
    )

    anthropic_client = AsyncAnthropic(
        api_key=config.anthropic.api_key,
    )

    dp.include_routers(
        rating_router,
        casino_router,
        title_router,
        fun_router,
        ai_router,
    )

    register_global_middlewares(dp, session_pool, storage)

    dp.workflow_data.update(
        ratings_cache=ratings_cache,
        anthropic_client=anthropic_client,
        openai_client=openai_client,
        elevenlabs_client=elevenlabs_client,
    )

    dp.message.filter(F.chat.id.in_({config.chat.prod, config.chat.debug}))

    bot.session.middleware(BotMessages(session_pool))
    await bot.delete_webhook()
    dp.startup.register(on_startup)
    dp.shutdown.register(shutdown)
    await dp.start_polling(bot, config=config)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.error("Бот був вимкнений!")
