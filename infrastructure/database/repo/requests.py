import datetime
import logging
from dataclasses import dataclass
from typing import List, Optional

from pytz import timezone
from sqlalchemy import desc, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.database.models import Base
from infrastructure.database.models.tables import (
    CryptoTransaction,
    MathProblem,
    MessageUser,
    RatingUsers,
)


class UkraineTimezoneMixin:
    def __init__(self):
        self.ukraine_tz = timezone("Europe/Kiev")

    def _get_current_ukraine_time(self):
        """Helper method to get the current time in Ukraine, respecting DST"""
        return datetime.datetime.now(self.ukraine_tz)


class RatingUsersRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_user_for_rating(self, user_id: int, rating: int):
        stmt = insert(RatingUsers).values(user_id=user_id, rating=rating)
        await self.session.execute(stmt)
        await self.session.commit()

    async def increment_rating_by_user_id(self, user_id: int, increment: int):
        stmt = (
            update(RatingUsers)
            .where(RatingUsers.user_id == user_id)
            .values(rating=RatingUsers.rating + increment)
            .returning(RatingUsers.rating)
        )
        new_rating = await self.session.execute(stmt)
        await self.session.commit()
        return new_rating.scalar()

    async def get_rating_by_user_id(self, user_id: int) -> Optional[int]:
        stmt = select(RatingUsers.rating).where(RatingUsers.user_id == user_id)
        result = await self.session.execute(stmt)
        rating = result.scalar()
        logging.info(f"Rating for user {user_id}: {rating}")
        return rating

    async def wipe_ratings(self):
        stmt = update(RatingUsers).values(rating=0)
        await self.session.execute(stmt)
        await self.session.commit()

    async def update_rating_by_user_id(self, user_id: int, rating: int):
        stmt = (
            update(RatingUsers)
            .where(RatingUsers.user_id == user_id)
            .values(rating=rating)
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_top_by_rating(self, limit=10) -> List[RatingUsers]:
        stmt = (
            select(RatingUsers.user_id, RatingUsers.rating)
            .order_by(RatingUsers.rating.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.all()


class MessageUserRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    # add message to the database
    # get user_id by message_id and chat_id
    async def add_message(self, user_id: int, chat_id: int, message_id: int):
        stmt = insert(MessageUser).values(
            user_id=user_id, chat_id=chat_id, message_id=message_id
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_user_id_by_message_id(
        self, chat_id: int, message_id: int
    ) -> Optional[int]:
        stmt = select(MessageUser.user_id).where(
            MessageUser.chat_id == chat_id, MessageUser.message_id == message_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class CryptoTransactionsRepo(UkraineTimezoneMixin):
    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def add_user_transaction(
        self,
        user_id: int,
        full_name: str,
        coin_id: int,
        coin_symbol: str,
        amount: float,
        points_spent: int,
        buy_price: float,
    ):
        current_time = self._get_current_ukraine_time()

        stmt = insert(CryptoTransaction).values(
            user_id=user_id,
            full_name=full_name,
            coin_id=coin_id,
            coin_symbol=coin_symbol,
            amount=amount,
            points_spent=points_spent,
            buy_price=buy_price,
            open_date=current_time,
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_user_open_transactions(self, user_id: int) -> List[CryptoTransaction]:
        stmt = (
            select(CryptoTransaction)
            .where(
                CryptoTransaction.user_id == user_id,
                CryptoTransaction.close_date.is_(None),
            )
            .order_by(desc(CryptoTransaction.open_date))
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_closed_transactions(
        self, user_id: int
    ) -> List[CryptoTransaction]:
        stmt = (
            select(CryptoTransaction)
            .where(
                CryptoTransaction.user_id == user_id,
                CryptoTransaction.close_date.isnot(None),
            )
            .order_by(desc(CryptoTransaction.close_date))
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_transactions_split(
        self, user_id: int
    ) -> tuple[List[CryptoTransaction], List[CryptoTransaction]]:
        open_transactions = await self.get_user_open_transactions(user_id)
        closed_transactions = await self.get_user_closed_transactions(user_id)
        return open_transactions, closed_transactions

    async def get_user_transaction(
        self, user_id: int, transaction_id: int
    ) -> CryptoTransaction | None:
        stmt = select(CryptoTransaction).where(
            CryptoTransaction.id == transaction_id,
            CryptoTransaction.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def close_user_transaction(
        self, user_id: int, transaction_id: int, sell_price: float
    ):
        current_time = self._get_current_ukraine_time()

        stmt = (
            update(CryptoTransaction)
            .where(
                CryptoTransaction.id == transaction_id,
                CryptoTransaction.user_id == user_id,
            )
            .values(sell_price=sell_price, close_date=current_time)
            .returning(CryptoTransaction)
        )
        result = await self.session.execute(stmt)
        transaction = result.scalar_one_or_none()

        if not transaction:
            return None

        # Calculate profit
        profit = (sell_price - transaction.buy_price) * transaction.amount

        # Update profit
        stmt = (
            update(CryptoTransaction)
            .where(
                CryptoTransaction.id == transaction_id,
                CryptoTransaction.user_id == user_id,
            )
            .values(profit=profit)
        )
        await self.session.execute(stmt)
        await self.session.commit()

        return transaction

    async def get_top_transactions(self, limit: int = 25) -> List[CryptoTransaction]:
        stmt = (
            select(CryptoTransaction)
            .where(CryptoTransaction.sell_price.isnot(None))
            .where(CryptoTransaction.profit > 0.1)
            .order_by(desc(CryptoTransaction.profit))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class MathProblemRepo(UkraineTimezoneMixin):
    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def add_math_problem(
        self,
        user_id: int,
        text: str | None,
        photo_path: str | None,
        additional_info: str | None,
    ) -> int:
        current_time = self._get_current_ukraine_time()

        stmt = (
            insert(MathProblem)
            .values(
                user_id=user_id,
                text=text,
                photo_path=photo_path,
                additional_info=additional_info,
                created_at=current_time,
            )
            .returning(MathProblem.id)
        )
        problem = await self.session.execute(stmt)
        await self.session.commit()
        return problem.scalar()

    async def update_problem_solution(self, problem_id: int, solution: str):
        stmt = (
            update(MathProblem)
            .where(MathProblem.id == problem_id)
            .values(solution=solution)
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_user_problems(self, user_id: int) -> List[MathProblem]:
        stmt = select(MathProblem).where(MathProblem.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_problem(
        self, problem_id: int, user_id: int
    ) -> MathProblem | None:
        stmt = select(MathProblem).where(
            MathProblem.id == problem_id, MathProblem.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


@dataclass
class RequestsRepo:
    """
    Repository for handling database operations. This class holds all the repositories for the database models.

    You can add more repositories as properties to this class, so they will be easily accessible.
    """

    session: AsyncSession

    @property
    def rating_users(self) -> RatingUsersRepo:
        return RatingUsersRepo(self.session)

    @property
    def message_user(self) -> MessageUserRepo:
        return MessageUserRepo(self.session)

    @property
    def crypto_transactions(self) -> CryptoTransactionsRepo:
        return CryptoTransactionsRepo(self.session)

    @property
    def math_problem(self) -> MathProblemRepo:
        return MathProblemRepo(self.session)


class Database:
    def __init__(self, engine):
        self.engine = engine

    async def create_tables(self):
        # Async function to create tables
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
