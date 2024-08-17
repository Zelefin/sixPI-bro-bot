from typing import Tuple


def calculate_expected_score(rating_a: int, rating_b: int) -> float:
    """Calculate the expected score for player A against player B."""
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


def get_k_factor(rating: int) -> int:
    """Determine the K-factor based on the player's rating."""
    if rating <= 100:
        return 40
    elif rating <= 300:
        return 32
    else:
        return 24


def update_ratings(rating_a: int, rating_b: int, score_a: float) -> Tuple[int, int]:
    """
    Update ratings for two players after a game.
    score_a should be 1 for a win, 0.5 for a draw, and 0 for a loss.
    """
    expected_a = calculate_expected_score(rating_a, rating_b)
    expected_b = 1 - expected_a

    k_a = get_k_factor(rating_a)
    k_b = get_k_factor(rating_b)

    new_rating_a = max(10, round(rating_a + k_a * (score_a - expected_a)))
    new_rating_b = max(10, round(rating_b + k_b * ((1 - score_a) - expected_b)))

    return new_rating_a, new_rating_b


def get_initial_rating() -> int:
    """Return the initial rating for a new player."""
    return 1000


# Example usage
if __name__ == "__main__":
    # Example: Player A (rating 1200) wins against Player B (rating 1000)
    player_a_rating = 1200
    player_b_rating = 1000
    player_a_score = 1  # 1 for win, 0.5 for draw, 0 for loss

    new_a_rating, new_b_rating = update_ratings(
        player_a_rating, player_b_rating, player_a_score
    )
    print(f"New ratings: Player A: {new_a_rating}, Player B: {new_b_rating}")

    # Example with very low ratings
    player_c_rating = 30
    player_d_rating = 50
    player_c_score = 0  # Player C loses

    new_c_rating, new_d_rating = update_ratings(
        player_c_rating, player_d_rating, player_c_score
    )
    print(f"New ratings: Player C: {new_c_rating}, Player D: {new_d_rating}")
