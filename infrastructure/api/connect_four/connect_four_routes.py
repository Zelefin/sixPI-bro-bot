import json
import logging
import uuid
from pathlib import Path

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiohttp import web, WSMsgType
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request
from aiohttp.web_response import json_response
from redis.asyncio.client import Redis

from infrastructure.api.common_routes import get_user_balance, update_user_balance
from infrastructure.api.utils import validate_telegram_data, parse_init_data
from infrastructure.database.repo.requests import RequestsRepo

from infrastructure.api.connect_four.game_logic import Game, GameStatus, Player
from infrastructure.api.connect_four.game_management import (
    add_player_to_waiting_room,
    get_waiting_player,
    create_game,
    end_game,
    get_game_state,
    update_game_state,
    get_active_games,
    get_game_participants,
    is_player_in_active_game,
)
from infrastructure.api.connect_four.elo_rating import (
    update_ratings,
    get_initial_rating,
)

# Store active WebSocket connections
active_connections = {}


async def index_handler(request: Request):
    return FileResponse(
        Path(__file__).parents[2].resolve()
        / "frontend/connect-four-app/dist/index.html"
    )


async def websocket_handler(request: Request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    session_pool = request.app["session_pool"]

    # Extract user data from the request
    try:
        data = await request.post()
        if not data or not validate_telegram_data(data.get("_auth")):
            await ws.close(code=4001, message=b"Unauthorized")
            return ws

        telegram_data = parse_init_data(data.get("_auth"))
        user = json.loads(telegram_data.get("user"))
        user_id = user.get("id")

        if not user_id:
            await ws.close(code=4002, message=b"Invalid user data")
            return ws

    except Exception as e:
        logging.error(f"Error in WebSocket authentication: {e}")
        await ws.close(code=4003, message=b"Authentication error")
        return ws

    active_connections[user_id] = ws

    try:
        redis: Redis = request.app["redis"]

        # Check if the player is already in an active game
        if await is_player_in_active_game(redis, str(user_id)):
            await ws.send_json(
                {"action": "error", "message": "You are already in an active game"}
            )
            return ws

        # Get the player's rating
        async with session_pool as session:
            repo = RequestsRepo(session)
            player_rating = await get_user_balance(
                user_id, repo
            )  # Assuming this returns the initial rating

        # Add player to waiting room
        await add_player_to_waiting_room(redis, str(user_id), player_rating)
        await ws.send_json({"action": "waiting_for_opponent"})

        # Check for waiting player
        opponent = await get_waiting_player(redis)
        if opponent:
            opponent_id, opponent_rating = opponent
            # Create a new game
            game = Game()
            game_id = str(uuid.uuid4())
            await create_game(
                redis, game_id, str(user_id), opponent_id, game.get_state()
            )

            # Notify both players
            for player_id in [str(user_id), opponent_id]:
                if player_id in active_connections:
                    await active_connections[player_id].send_json(
                        {
                            "action": "game_start",
                            "game_id": game_id,
                            "opponent_id": (
                                opponent_id
                                if player_id == str(user_id)
                                else str(user_id)
                            ),
                        }
                    )

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                if data["action"] == "make_move":
                    game_id = data["game_id"]
                    column = data["column"]

                    game_state = await get_game_state(redis, game_id)
                    if not game_state:
                        await ws.send_json(
                            {"action": "error", "message": "Game not found"}
                        )
                        continue

                    game = Game()
                    game.__dict__.update(game_state)  # Deserialize the game state

                    if game.current_player == Player(
                        user_id % 2 + 1
                    ):  # Ensure it's the player's turn
                        if game.make_move(column):
                            # Update the game state in Redis
                            await update_game_state(redis, game_id, game.get_state())

                            # Send update to players
                            participants = await get_game_participants(redis, game_id)
                            for player_id in participants:
                                if player_id in active_connections:
                                    await active_connections[player_id].send_json(
                                        {
                                            "action": "game_update",
                                            "game_state": game.get_state(),
                                        }
                                    )

                            if game.status != GameStatus.ONGOING:
                                # Handle game over
                                winner_id = (
                                    str(user_id)
                                    if game.winner == Player(user_id % 2 + 1)
                                    else opponent_id
                                )
                                loser_id = (
                                    opponent_id
                                    if winner_id == str(user_id)
                                    else str(user_id)
                                )

                                # Get current ratings or use initial rating if not set
                                winner_rating = (
                                    get_initial_rating()
                                )  # Replace with actual rating retrieval
                                loser_rating = (
                                    get_initial_rating()
                                )  # Replace with actual rating retrieval

                                # Update ratings
                                new_winner_rating, new_loser_rating = update_ratings(
                                    winner_rating, loser_rating, 1  # 1 for win
                                )

                                # Store updated ratings (implement this function)
                                async with session_pool as session:
                                    repo = RequestsRepo(session)
                                    await update_user_balance(user_id, ...)
                                # await update_player_rating(redis, winner_id, new_winner_rating)
                                # await update_player_rating(redis, loser_id, new_loser_rating)

                                # Notify players of game result
                                for player_id in participants:
                                    if player_id in active_connections:
                                        await active_connections[player_id].send_json(
                                            {
                                                "action": "game_over",
                                                "winner_id": winner_id,
                                                "game_state": game.get_state(),
                                                "new_ratings": {
                                                    winner_id: new_winner_rating,
                                                    loser_id: new_loser_rating,
                                                },
                                            }
                                        )

                                # End the game and clean up
                                await end_game(redis, game_id)
                        else:
                            await ws.send_json(
                                {"action": "error", "message": "Invalid move"}
                            )
                    else:
                        await ws.send_json(
                            {"action": "error", "message": "Not your turn"}
                        )

            elif msg.type == WSMsgType.ERROR:
                logging.error(
                    f"WebSocket connection closed with exception {ws.exception()}"
                )

    finally:
        del active_connections[user_id]
        # Remove player from waiting room if they disconnect while waiting
        # Implement a function to remove player from waiting room

    return ws


async def start_game(request: Request):
    data = await request.post()
    if not data or not validate_telegram_data(data.get("_auth")):
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    telegram_data = parse_init_data(data.get("_auth"))
    user = json.loads(telegram_data.get("user"))
    user_id = user.get("id")

    redis: Redis = request.app["redis"]

    # Add player to queue
    await add_player_to_queue(redis, str(user_id))

    return json_response({"ok": True, "message": "Added to game queue"})


def setup_connect_four_routes(app: web.Application):
    app.router.add_get("", index_handler)
    app.router.add_get("/ws", websocket_handler)
    app.router.add_post("/start", start_game)
    app.router.add_static(
        "/assets/",
        Path(__file__).parents[2].resolve() / "frontend/connect-four-app/dist/assets",
    )
