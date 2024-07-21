from dataclasses import dataclass
from typing import List, Dict
import uuid


@dataclass
class Table:
    id: str
    name: str
    small_blind: int
    big_blind: int
    min_buy_in: int
    max_buy_in: int
    max_players: int
    current_players: int

    @classmethod
    def create(cls, name: str, min_buy_in: int, max_buy_in: int, max_players: int):
        small_blind = round(min_buy_in * 0.1)  # 10% of min_buy_in
        big_blind = small_blind * 2

        return cls(
            id=str(uuid.uuid4()),
            name=name,
            small_blind=small_blind,
            big_blind=big_blind,
            min_buy_in=min_buy_in,
            max_buy_in=max_buy_in,
            max_players=max_players,
            current_players=0,
        )

    def add_player(self):
        if self.current_players < self.max_players:
            self.current_players += 1
            return True
        return False

    def remove_player(self):
        if self.current_players > 0:
            self.current_players -= 1
            return True
        return False


# In-memory storage for tables (replace with database in production)
tables: Dict[str, Table] = {}


def get_available_tables() -> List[Table]:
    return list(tables.values())


def get_table(table_id: str) -> Table:
    return tables.get(table_id)


def create_table(
    name: str, min_buy_in: int, max_buy_in: int, max_players: int
) -> Table:
    new_table = Table.create(name, min_buy_in, max_buy_in, max_players)
    tables[new_table.id] = new_table
    return new_table


# Initialize some sample tables
sample_tables = [
    Table.create("Super lobby", 10, 30, 12),
    Table.create("KEKE", 50, 100, 9),
]
for table in sample_tables:
    tables[table.id] = table
