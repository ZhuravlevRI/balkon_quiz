from collections.abc import Generator

from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings


def _sqlite_connect_args() -> dict[str, bool]:
    if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    echo=settings.SQL_ECHO,
    connect_args=_sqlite_connect_args(),
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def init_db() -> None:
    # Model metadata is registered by importing app.models.
    import app.models  # noqa: F401

    SQLModel.metadata.create_all(engine)
