import datetime
from sqlalchemy import BIGINT, TIMESTAMP, Float, Integer, String, func
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


class CryptoTransaction(Base, TableNameMixin):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BIGINT, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    coin_id: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # coin id on coinmarketcup
    coin_symbol: Mapped[str] = mapped_column(String(10), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    buy_price: Mapped[float] = mapped_column(Float, nullable=False)
    sell_price: Mapped[float] = mapped_column(Float, nullable=True)
    profit: Mapped[float] = mapped_column(Float, nullable=True)
    open_date: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP, server_default=func.now()
    )
    close_date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=True)

    def __repr__(self):
        return f"<CryptoTransaction id={self.id} user_id={self.user_id} crypto={self.crypto.value} amount={self.amount}>"
