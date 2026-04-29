import uuid

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    User,
    UserCreate,
    Quiz,
    QuizBase,
    QuizUpdate,
    Question,
    QuestionCreate,
    QuestionBase,
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
    db_obj = Quiz(created_by_id=user_id)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_quiz_list(*, session: Session, user_id: uuid.UUID, page: int) -> list[Quiz]:
    if page < 0:
        page = 0

    return session.exec(
        select(Quiz)
        .where(Quiz.created_by_id == user_id)
        .offset(10 * page)
        .limit(10)
    ).all()


def get_quiz_by_id(*, session: Session, user_id: uuid.UUID, quiz_id: uuid.UUID) -> Quiz | None:
    return session.exec(
        select(Quiz)
        .where(Quiz.id == quiz_id, Quiz.created_by_id == user_id)
    ).first()


def update_quiz(*, session: Session, quiz_id: uuid.UUID, user_id: uuid.UUID, quiz_in: QuizUpdate) -> Quiz | None:
    current_quiz = get_quiz_by_id(session=session, quiz_id=quiz_id, user_id=user_id)
    if not current_quiz:
        return None

    old_questions = get_questions_by_quiz(
        session=session,
        quiz_id=quiz_id,
        user_id=user_id,
    )

    new_questions = []
    if quiz_in.questions:
        for count, question_data in enumerate(quiz_in.questions):
            try:
                question_dict = question_data.model_dump()
                question_dict.update({
                    'quiz_id': quiz_id,
                    'order': count
                })
                validated_question = Question.model_validate(question_dict)
                new_questions.append(validated_question)

            except Exception as e:
                raise ValueError(f"Can't validate question at index {count}: {e}") from e

    quiz_data = quiz_in.model_dump(exclude_unset=True, exclude={'questions'})
    allowed_fields = {'title', 'description'}

    for field in allowed_fields:
        if field in quiz_data:
            setattr(current_quiz, field, quiz_data[field])

    try:
        for question in old_questions:
            session.delete(question)

        for question in new_questions:
            session.add(question)

        session.commit()
        session.refresh(current_quiz)

    except Exception as e:
        session.rollback()
        raise RuntimeError(f"Database error while updating quiz {quiz_id}: {e}") from e

    return current_quiz


def delete_quiz(*, session: Session, quiz_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    quiz = get_quiz_by_id(session=session, quiz_id=quiz_id, user_id=user_id)

    if not quiz:
        return False
    session.delete(quiz)
    session.commit()
    return True


def create_question(
    *,
    session: Session,
    question_data: QuestionCreate,
    user_id: uuid.UUID,
    order: int | None = None,
) -> Question | None:
    quiz = session.exec(
        select(Quiz).where(
            Quiz.id == question_data.quiz_id,
            Quiz.created_by_id == user_id
        )
    ).first()
    if not quiz:
        return None

    if order is None:
        max_order = session.exec(
            select(Question.order)
            .where(Question.quiz_id == question_data.quiz_id)
            .order_by(Question.order.desc())
        ).first()
        if max_order is not None:
            order = (max_order + 1)
        else:
            order = 0

    question_dict = question_data.model_dump(exclude={'order'})
    question_dict['order'] = order

    db_obj = Question.model_validate(question_dict)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_questions_by_quiz(*, session: Session, quiz_id: uuid.UUID, user_id: uuid.UUID) -> list[Question]:
    quiz = session.exec(
        select(Quiz).where(
            Quiz.id == quiz_id,
            Quiz.created_by_id == user_id
        )
    ).first()
    if not quiz:
        return []

    return session.exec(
        select(Question)
        .where(Question.quiz_id == quiz_id)
        .order_by(Question.order)
    ).all()


def get_question_by_id(*, session: Session, question_id: uuid.UUID) -> Question | None:
    return session.exec(select(Question).where(Question.id == question_id)).first()


def delete_question(*, session: Session, question_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    question = get_question_by_id(session=session, question_id=question_id)
    if not question:
        return False

    quiz = session.exec(
        select(Quiz).where(
            Quiz.id == question.quiz_id,
            Quiz.created_by_id == user_id,
        )
    ).first()
    if not quiz:
        return False

    session.delete(question)
    session.commit()
    return True
