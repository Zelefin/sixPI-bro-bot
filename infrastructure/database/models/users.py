from sqlalchemy import BIGINT, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TableNameMixin, TimestampMixin


class RatingUsers(Base, TimestampMixin, TableNameMixin):
    """
    Represents user ratings in the application.
    """

    user_id: Mapped[int] = mapped_column(BIGINT, primary_key=True, autoincrement=False)
    rating: Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self):
        return f"<RatingUsers user_id={self.user_id} rating={self.rating}>"
