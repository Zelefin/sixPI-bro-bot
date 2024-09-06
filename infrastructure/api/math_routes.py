import json
import logging
import random
from pathlib import Path
import aiofiles
import os
from uuid import uuid4

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiohttp import web
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request
from aiohttp.web_response import json_response

from infrastructure.api import background_tasks
from infrastructure.api.common_routes import (
    get_user_balance,
    update_user_balance,
    check_rate_limit,
)
from infrastructure.api.utils import validate_telegram_data, parse_init_data
from infrastructure.database.repo.requests import RequestsRepo


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve() / "frontend/math-app/dist/index.html"
    )


async def upload_problem(request: Request):
    data = await request.post()

    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(data.get("_auth"))
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    if check_rate_limit(user_id):
        return json_response({"ok": False, "err": "Rate limit exceeded"}, status=429)

    photo = data.get("photo")
    problem_text = data.get("problem_text")
    additional_info = data.get("additional_info")
    provider = data.get("provider")

    if not photo or not problem_text:
        return web.json_response(
            {"ok": False, "error": "No photo or problem text provided"}
        )

    session_pool = request.app["session_pool"]
    task_manager: background_tasks.BackgroundTaskManager = request.app["task_manager"]

    file_path = None
    if photo:
        upload_dir = Path(__file__).parents[2].resolve() / "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{uuid4()}.jpg"
        file_path = upload_dir / filename

        # Save the file
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(photo.file.read())

    async with session_pool() as session:
        repo = RequestsRepo(session)
        problem_id = await repo.math_problem.add_math_problem(
            user_id=user_id,
            text=problem_text if not photo else None,
            photo_path=str(file_path) if file_path else None,
            additional_info=additional_info,
        )

    await task_manager.run_task(
        task_manager.solve_math_problem, problem_id, session_pool, provider
    )

    return web.json_response({"ok": True, "message": "Problem uploaded successfully"})


async def get_problems(request: Request):
    auth_header = request.headers.get("_auth")
    if not auth_header or not validate_telegram_data(auth_header):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(auth_header)
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    session_pool = request.app["session_pool"]
    async with session_pool() as session:
        repo = RequestsRepo(session)
        problems = await repo.math_problem.get_user_problems(user_id)

    return web.json_response({"ok": True, "problems": problems})


async def get_problem(request: Request):
    auth_header = request.headers.get("_auth")
    if not auth_header or not validate_telegram_data(auth_header):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(auth_header)
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    problem_id = request.match_info.get("problem_id")

    session_pool = request.app["session_pool"]
    async with session_pool() as session:
        repo = RequestsRepo(session)
        problem = await repo.math_problem.get_user_problem(problem_id, user_id)

    return web.json_response({"ok": True, "problem": problem})


def setup_math_solver_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_post("/math/api/upload", upload_problem)
    app.router.add_get("/math/api/problems", get_problems)
    app.router.add_get("/math/api/problems/{problem_id}", get_problem)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/math-app/dist/assets",
    )
