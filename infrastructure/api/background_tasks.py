import asyncio
import logging
from typing import Callable, Any
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup
from bot.services.ai_service.ai_math_solver import AIMathSolver
from infrastructure.database.repo.requests import RequestsRepo


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

    async def solve_math_problem(self, problem_id: int, session_pool, provider: str):
        async with session_pool() as session:
            repo = RequestsRepo(session)
            problem = await repo.math_problem.get_problem(problem_id)

            if not problem:
                logging.error(f"Problem with id {problem_id} not found")
                return

            math_solver = AIMathSolver(provider)
            try:
                solution = await math_solver.solve_problem(
                    text=problem.text,
                    photo_path=problem.photo_path,
                    additional_info=problem.additional_info,
                )
                await repo.math_problem.update_problem_solution(problem_id, solution)
                # You might want to send a notification to the user here
            except Exception as e:
                logging.error(f"Failed to solve problem with id {problem_id}: {str(e)}")
                # Handle the error, maybe update the problem status in the database
