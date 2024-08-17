from typing import List, Tuple, Optional
from enum import Enum
import time


class Player(Enum):
    NONE = 0
    ONE = 1
    TWO = 2


class GameStatus(Enum):
    ONGOING = 0
    WIN = 1
    DRAW = 2
    TIMEOUT = 3


class Game:
    def __init__(self, rows: int = 6, cols: int = 7, time_limit: int = 30):
        self.rows = rows
        self.cols = cols
        self.board: List[List[Player]] = [
            [Player.NONE for _ in range(cols)] for _ in range(rows)
        ]
        self.current_player = Player.ONE
        self.status = GameStatus.ONGOING
        self.winner: Optional[Player] = None
        self.last_move: Optional[Tuple[int, int]] = None  # (row, col)
        self.time_limit = time_limit  # Time limit in seconds
        self.player_timers = {Player.ONE: time_limit, Player.TWO: time_limit}
        self.last_move_time = time.time()

    def make_move(self, col: int) -> bool:
        """Attempt to make a move in the specified column."""
        if self.status != GameStatus.ONGOING or col < 0 or col >= self.cols:
            return False

        # Update timer for current player
        current_time = time.time()
        elapsed_time = current_time - self.last_move_time
        self.player_timers[self.current_player] -= elapsed_time

        # Check if player ran out of time
        if self.player_timers[self.current_player] <= 0:
            self.status = GameStatus.TIMEOUT
            self.winner = (
                Player.TWO if self.current_player == Player.ONE else Player.ONE
            )
            return False

        # Find the lowest empty row in the column
        for row in range(self.rows - 1, -1, -1):
            if self.board[row][col] == Player.NONE:
                self.board[row][col] = self.current_player
                self.last_move = (row, col)
                self._check_game_over()
                self._switch_player()
                self.last_move_time = current_time
                return True

        return False  # Column is full

    def _check_game_over(self):
        """Check if the game is over (win or draw)."""
        if self.last_move is None:
            return

        row, col = self.last_move
        player = self.board[row][col]

        # Check for a win
        if (
            self._check_direction(row, col, 1, 0)  # Vertical
            or self._check_direction(row, col, 0, 1)  # Horizontal
            or self._check_direction(row, col, 1, 1)  # Diagonal /
            or self._check_direction(row, col, 1, -1)
        ):  # Diagonal \
            self.status = GameStatus.WIN
            self.winner = player
            return

        # Check for a draw
        if all(self.board[0][c] != Player.NONE for c in range(self.cols)):
            self.status = GameStatus.DRAW

    def _check_direction(self, row: int, col: int, dx: int, dy: int) -> bool:
        """Check for a win in a specific direction."""
        count = 1
        player = self.board[row][col]

        for direction in [1, -1]:
            r, c = row + direction * dx, col + direction * dy
            while (
                0 <= r < self.rows and 0 <= c < self.cols and self.board[r][c] == player
            ):
                count += 1
                if count == 4:
                    return True
                r, c = r + direction * dx, c + direction * dy

        return False

    def _switch_player(self):
        """Switch the current player."""
        self.current_player = (
            Player.TWO if self.current_player == Player.ONE else Player.ONE
        )

    def get_state(self) -> dict:
        """Return the current state of the game."""
        return {
            "board": [[cell.value for cell in row] for row in self.board],
            "currentPlayer": self.current_player.value,
            "status": self.status.value,
            "winner": self.winner.value if self.winner else None,
            "lastMove": self.last_move,
            "playerTimers": {
                player.value: round(time) for player, time in self.player_timers.items()
            },
        }


# Helper function to create a new game
def create_game(time_limit: int = 30) -> Game:
    return Game(time_limit=time_limit)
