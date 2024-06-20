from sqlalchemy import BIGINT, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TableNameMixin


class RatingUsers(Base):
    __tablename__ = "RatingUsers"
    """
    Represents user ratings in the application.
    """
    user_id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=False)
    rating: Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self):
        return f"<RatingUsers user_id={self.user_id} rating={self.rating}>"


class MessageUser(Base, TableNameMixin):
    user_id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=False)
    chat_id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=False)
    message_id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=False
    )
