import json
import logging
import random
from pathlib import Path

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiohttp import web
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request
from aiohttp.web_response import json_response

from infrastructure.api.common_routes import (
    get_user_balance,
    update_user_balance,
    check_rate_limit,
)
from infrastructure.api.utils import validate_telegram_data, parse_init_data
from infrastructure.database.repo.requests import RequestsRepo


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/math-solver-app/dist/index.html"
    )


def setup_math_solver_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/math-solver-app/dist/assets",
    )
