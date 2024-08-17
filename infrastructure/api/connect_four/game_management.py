# game_management.py

from typing import List, Tuple, Optional
from redis.asyncio import Redis
import json

# Redis key prefixes
WAITING_ROOM_KEY = "connect_four:waiting_room"
ACTIVE_GAMES_KEY = "connect_four:active_games"
GAME_STATE_PREFIX = "connect_four:game_state:"


async def add_player_to_waiting_room(redis: Redis, player_id: str, rating: int) -> None:
    player_data = json.dumps({"id": player_id, "rating": rating})
    await redis.lpush(WAITING_ROOM_KEY, player_data)


async def get_waiting_player(redis: Redis) -> Optional[Tuple[str, int]]:
    player_data = await redis.rpop(WAITING_ROOM_KEY)
    if player_data:
        player = json.loads(player_data)
        return player["id"], player["rating"]
    return None


async def create_game(
    redis: Redis, game_id: str, player1_id: str, player2_id: str, initial_state: dict
) -> None:
    game_data = json.dumps({"id": game_id, "players": [player1_id, player2_id]})
    await redis.hset(ACTIVE_GAMES_KEY, game_id, game_data)
    await redis.set(f"{GAME_STATE_PREFIX}{game_id}", json.dumps(initial_state))


async def end_game(redis: Redis, game_id: str) -> None:
    """
    End a game by removing it from active games and deleting its state.

    :param redis: Redis connection
    :param game_id: Unique identifier for the game to be ended
    """
    await redis.hdel(ACTIVE_GAMES_KEY, game_id)
    await redis.delete(f"{GAME_STATE_PREFIX}{game_id}")


async def get_game_state(redis: Redis, game_id: str) -> Optional[dict]:
    game_state = await redis.get(f"{GAME_STATE_PREFIX}{game_id}")
    return json.loads(game_state) if game_state else None


async def update_game_state(redis: Redis, game_id: str, new_state: dict) -> None:
    await redis.set(f"{GAME_STATE_PREFIX}{game_id}", json.dumps(new_state))


async def get_active_games(redis: Redis) -> List[dict]:
    active_games = await redis.hgetall(ACTIVE_GAMES_KEY)
    return [json.loads(game_data) for game_data in active_games.values()]


async def get_game_participants(redis: Redis, game_id: str) -> Optional[List[str]]:
    game_data = await redis.hget(ACTIVE_GAMES_KEY, game_id)
    if game_data:
        game = json.loads(game_data)
        return game["players"]
    return None


async def is_player_in_active_game(redis: Redis, player_id: str) -> bool:
    active_games = await get_active_games(redis)
    return any(player_id in game["players"] for game in active_games)
