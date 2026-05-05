# TODO make

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.enums import GameSessionStatusEnum


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)

# ================ User ===================


class UserBase(SQLModel):
    username: str = Field(unique=True, index=True, max_length=50)
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    username: str = Field(max_length=50)
    password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    hashed_password: str
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    quizzes_created: list["Quiz"] = Relationship(
        back_populates="created_by",
        sa_relationship_kwargs={"lazy": "dynamic"},
    )

    gamesession_created: "GameSession" = Relationship(
        back_populates="created_by",
        sa_relationship_kwargs={"uselist": False},
    )


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None

# ============== Question =================


class QuestionBase(SQLModel):
    title: str
    img: str | None = None
    answer0: str
    answer1: str
    answer2: str
    answer3: str
    correct: int = Field(ge=0, le=3)


class QuestionCreate(QuestionBase):
    quiz_id: uuid.UUID


class QuestionUpdate(SQLModel):
    title: str | None = None
    img: str | None = None
    answer0: str | None = None
    answer1: str | None = None
    answer2: str | None = None
    answer3: str | None = None
    correct: int | None = Field(default=None, ge=0, le=3)


class QuestionResponse(QuestionBase):
    id: uuid.UUID
    quiz_id: uuid.UUID
    order: int

    class Config:
        from_attributes = True


class Question(QuestionBase, table=True):
    __tablename__ = "questions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    quiz_id: uuid.UUID = Field(foreign_key="quizzes.id", ondelete="CASCADE")
    order: int = Field(ge=0)
    quiz: "Quiz" = Relationship(back_populates="questions")

# ================ Quiz ===================


class QuizBase(SQLModel):
    title: str = Field(default="Новый квиз", min_length=1, max_length=255)
    description: str = Field(default="", max_length=255)


class QuizCreate(SQLModel):
    id: uuid.UUID


class QuizUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    questions: list[QuestionUpdate] | None = None


class QuizResponse(QuizBase):
    id: uuid.UUID
    created_at: datetime
    created_by_id: uuid.UUID

    class Config:
        from_attributes = True


class QuizWithQuestions(QuizResponse):
    questions: list["QuestionResponse"] = []


class Quiz(QuizBase, table=True):
    __tablename__ = "quizzes"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

    questions: list["Question"] = Relationship(
        back_populates="quiz",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    created_by_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="users.id",
        ondelete="SET NULL",
    )

    created_by: User | None = Relationship(back_populates="quizzes_created")

# ============= GameSession ================


class GameSessionBase(SQLModel):
    code: str = Field(min_length=6, max_length=6)
    status: GameSessionStatusEnum
    question_number: int = Field(default=0, ge=0)


class GameSessionCreate(SQLModel):
    id: uuid.UUID


class GameSession(GameSessionBase, table=True):
    __tablename__ = "sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

    quiz_id: uuid.UUID | None = Field(default=None, foreign_key="quizzes.id")

    players: list["Player"] = Relationship(back_populates="current_gamesession")

    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    created_by_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="users.id",
        ondelete="SET NULL",
        unique=True,
    )

    created_by: User | None = Relationship(back_populates="gamesession_created")

# ================ Player ==================


class PlayerBase(SQLModel):
    username: str = Field(unique=True, index=True, max_length=50)


class Player(PlayerBase, table=True):
    __tablename__ = "players"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

    session_id: uuid.UUID = Field(foreign_key="sessions.id")

    current_gamesession: "GameSession" = Relationship(
        back_populates="players",
    )

    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


class PlayerPublic(PlayerBase):
    id: uuid.UUID
    created_at: datetime | None = None

# ================ Other ===================


class Message(SQLModel):
    message: str


class AuthResponse(SQLModel):
    is_auth_good: bool
