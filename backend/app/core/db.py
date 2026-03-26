from collections.abc import Generator
from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings


engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    echo=settings.SQL_ECHO,
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
