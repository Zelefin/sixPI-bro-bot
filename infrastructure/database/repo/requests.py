import logging
from dataclasses import dataclass
from typing import List, Optional

from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.database.models import Base
from infrastructure.database.models.tables import (
    MessageUser,
    RatingUsers,
)


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


class Database:
    def __init__(self, engine):
        self.engine = engine

    async def create_tables(self):
        # Async function to create tables
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
