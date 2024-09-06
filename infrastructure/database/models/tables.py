import datetime
from sqlalchemy import (
    BIGINT,
    TIMESTAMP,
    CheckConstraint,
    Float,
    Integer,
    String,
    Text,
    TypeDecorator,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from pytz import timezone

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


class TZTimeStamp(TypeDecorator):
    impl = TIMESTAMP
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return value.astimezone(timezone("UTC"))
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            ukraine_tz = timezone("Europe/Kiev")
            return value.replace(tzinfo=timezone("UTC")).astimezone(ukraine_tz)
        return value


class CryptoTransaction(Base, TableNameMixin):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BIGINT, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    coin_id: Mapped[int] = mapped_column(Integer, nullable=False)
    coin_symbol: Mapped[str] = mapped_column(String(10), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    buy_price: Mapped[float] = mapped_column(Float, nullable=False)
    sell_price: Mapped[float] = mapped_column(Float, nullable=True)
    profit: Mapped[float] = mapped_column(Float, nullable=True)
    open_date: Mapped[datetime.datetime] = mapped_column(
        TZTimeStamp, server_default=func.now()
    )
    close_date: Mapped[datetime.datetime] = mapped_column(TZTimeStamp, nullable=True)

    def __repr__(self):
        return f"<CryptoTransaction id={self.id} user_id={self.user_id} coin_symbol={self.coin_symbol} amount={self.amount}>"


class MathProblem(Base, TableNameMixin):
    __table_args__ = (
        CheckConstraint(
            "problem_text IS NOT NULL OR photo_path IS NOT NULL",
            name="check_problem_text_or_photo_path",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BIGINT, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=True)
    photo_path: Mapped[str] = mapped_column(String(255), nullable=True)
    additional_info: Mapped[str] = mapped_column(Text, nullable=True)
    solution: Mapped[str] = mapped_column(
        Text, nullable=True, default="", server_default=""
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        TZTimeStamp, server_default=func.now()
    )

    def __repr__(self):
        problem_type = "text" if self.problem_text else "photo"
        return f"<MathProblem id={self.id} user_id={self.user_id} problem_type={problem_type}>"
