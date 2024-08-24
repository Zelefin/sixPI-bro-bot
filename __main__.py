import asyncio
from pathlib import Path

from aiogram.webhook.aiohttp_server import (
    SimpleRequestHandler,
    setup_application,
    ip_filter_middleware,
)
from aiogram.webhook.security import IPFilter
from aiohttp import web
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
from redis.asyncio.client import Redis
from redis.asyncio.connection import ConnectionPool

from infrastructure.api.background_tasks import BackgroundTaskManager
from infrastructure.api.casino_routes import setup_casino_routes
from infrastructure.api.common_routes import setup_common_routes
from infrastructure.api.crypto_exchange_api.main import setup_crypto_exchange_routes
from infrastructure.api.wordle_routes import setup_wordle_routes

# from infrastructure.api.connect_four.connect_four_routes import (
#     setup_connect_four_routes,
# )
from infrastructure.database.repo.requests import Database
from infrastructure.database.setup import create_engine, create_session_pool
from bot.config_reader import Config, load_config
from bot.handlers.other import other_router
from bot.handlers.ai import ai_router
from bot.handlers.title import title_router
from bot.handlers.web_apps import web_apps_router
from bot.handlers.rating import rating_router

from bot.middlewares.bot_messages import BotMessages
from bot.middlewares.database import DatabaseMiddleware
from bot.middlewares.ratings_cache import MessageUserMiddleware
from bot.middlewares.throttling import ThrottlingMiddleware
from bot.misc.default_commands import set_default_commands
from bot.services import broadcaster
from aiogram.client.default import DefaultBotProperties


async def on_startup(bot: Bot, config: Config, client: Client, dp: Dispatcher) -> None:
    if config.bot.use_webhook:
        await set_webhook(bot, dp, config)
    await broadcaster.broadcast(bot, [config.admin.id], "Бот був запущений")
    await set_default_commands(bot)
    await client.start()


async def shutdown(client: Client) -> None:
    await client.stop()


async def start_dispatcher(bot: Bot, dp: Dispatcher) -> None:
    await dp.start_polling(bot)


async def set_webhook(bot: Bot, dp: Dispatcher, config: Config) -> None:
    me = await bot.get_me()
    url = f"{config.web.domain}{config.bot.webhook_path}"
    logging.info(
        f"Run webhook for bot https://t.me/{me.username} "
        f'id={bot.id} - "{me.full_name}" on {url}'
    )
    await bot.set_webhook(
        url=url,
        drop_pending_updates=True,
        allowed_updates=dp.resolve_used_update_types(),
        secret_token=config.bot.webhook_secret,
    )


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
    return logger


def main():
    logger = setup_logging()

    config = load_config(".env")
    pool = ConnectionPool.from_url(config.redis.make_connection_string())
    redis = Redis(connection_pool=pool)
    storage = RedisStorage.from_url(
        config.redis.make_connection_string(),
        key_builder=DefaultKeyBuilder(with_bot_id=True, with_destiny=True),
    )
    task_manager = BackgroundTaskManager()

    bot = Bot(token=config.bot.token, default=DefaultBotProperties(parse_mode="HTML"))
    engine = create_engine(
        f"sqlite+aiosqlite:///{Path(__file__).parent.resolve()}/data/main.db"
    )
    db = Database(engine)
    client = Client(
        name="bot",
        bot_token=config.bot.token,
        api_id=config.telegram_api.id,
        api_hash=config.telegram_api.hash,
        no_updates=True,  # We don't need to handle incoming updates by client
    )
    dp = Dispatcher(storage=storage, fsm_strategy=FSMStrategy.CHAT)
    asyncio.run(db.create_tables())
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
        web_apps_router,
        title_router,
        other_router,
        ai_router,
    )

    register_global_middlewares(dp, session_pool, storage)

    dp.workflow_data.update(
        ratings_cache=ratings_cache,
        anthropic_client=anthropic_client,
        openai_client=openai_client,
        elevenlabs_client=elevenlabs_client,
        config=config,
        client=client,
        dp=dp,
    )

    dp.message.filter(F.chat.id.in_({config.chat.prod, config.chat.debug}))

    bot.session.middleware(BotMessages(session_pool))

    dp.startup.register(on_startup)
    dp.shutdown.register(shutdown)

    if config.bot.use_webhook:
        # Run webhook
        app = web.Application()
        app["bot"] = bot
        app["config"] = config
        app["session_pool"] = session_pool

        webhook_request_handler = SimpleRequestHandler(
            dispatcher=dp, bot=bot, secret_token=config.bot.webhook_secret
        )

        setup_common_routes(app)

        casino_app = web.Application()
        casino_app["bot"] = bot
        casino_app["config"] = config
        casino_app["session_pool"] = session_pool
        casino_app["task_manager"] = task_manager
        setup_casino_routes(casino_app)
        app.add_subapp("/casino", casino_app)

        wordle_app = web.Application()
        wordle_app["bot"] = bot
        wordle_app["config"] = config
        wordle_app["redis"] = redis
        wordle_app["session_pool"] = session_pool
        wordle_app["task_manager"] = task_manager
        setup_wordle_routes(wordle_app)
        app.add_subapp("/wordle", wordle_app)

        crypto_exchange_app = web.Application()
        crypto_exchange_app["config"] = config
        crypto_exchange_app["redis"] = redis
        crypto_exchange_app["session_pool"] = session_pool
        setup_crypto_exchange_routes(crypto_exchange_app)
        app.add_subapp("/crypto-exchange", crypto_exchange_app)

        webhook_request_handler.register(app, path=config.bot.webhook_path)
        setup_application(app, dp, bot=bot)

        ip_filter_middleware(ip_filter=IPFilter.default())

        logger.info(f"Running app on {config.web.host}:{config.web.port}")
        web.run_app(app, host=config.web.host, port=config.web.port)
    else:
        asyncio.run(start_dispatcher(bot=bot, dp=dp))


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        logging.error("Бот був вимкнений!")
