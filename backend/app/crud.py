import uuid

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    User,
    UserCreate,
    Quiz,
    QuizBase,
)


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_user_by_id(*, session: Session, user_id: uuid.UUID) -> User | None:
    statement = select(User).where(User.id == user_id)
    session_user = session.exec(statement).first()
    return session_user


def get_user_by_name(*, session: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    session_user = session.exec(statement).first()
    return session_user


# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate(*, session: Session, username: str, password: str) -> User | None:
    db_user = get_user_by_name(session=session, username=username)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        # This ensures the response time is similar whether or not the email exists
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    return db_user


def create_quiz(*, session: Session, user_id: uuid.UUID) -> Quiz:
    db_item = Quiz(created_by_id=user_id)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def get_quiz_list(*, session: Session, user_id: uuid.UUID, page: int) -> list[QuizBase]:
    return session.exec(select(Quiz).where(Quiz.created_by_id == user_id).offset(10 * page).limit(10))
