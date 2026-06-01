import uuid
import random
import string

from fastapi import HTTPException, status

from sqlmodel import Session as DBSession
from sqlmodel import select
from sqlalchemy import func

from app.core.security import get_password_hash, verify_password
from app.models import (
    User,
    UserCreate,
    Quiz,
    QuizUpdate,
    Question,
    QuestionCreate,
    GameSession,
    Player,
    AnswerValidationResult,
)
from app.enums import GameSessionStatusEnum

# =============== User ================


def create_user(*,
                db_session: DBSession,
                user_create: UserCreate
                ) -> User:
    db_user = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return db_user


def get_user_by_id(*,
                   db_session: DBSession,
                   user_id: uuid.UUID
                   ) -> User | None:
    statement = select(User).where(User.id == user_id)
    db_user = db_session.exec(statement).first()
    return db_user


def get_user_by_name(*,
                     db_session: DBSession,
                     username: str
                     ) -> User | None:
    statement = select(User).where(User.username == username)
    db_user = db_session.exec(statement).first()
    return db_user


# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate(*,
                 db_session: DBSession,
                 username: str,
                 password: str
                 ) -> User | None:
    db_user = get_user_by_name(db_session=db_session, username=username)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        # This ensures the response time is similar whether or not the username exists
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        db_session.add(db_user)
        db_session.commit()
        db_session.refresh(db_user)
    return db_user

# =============== Quiz ================


def create_quiz(*,
                db_session: DBSession,
                user_id: uuid.UUID
                ) -> Quiz:
    db_quiz = Quiz(created_by_id=user_id)
    db_session.add(db_quiz)
    db_session.commit()
    db_session.refresh(db_quiz)
    return db_quiz


def get_quiz_list(*,
                  db_session: DBSession,
                  user_id: uuid.UUID,
                  page: int
                  ) -> list[Quiz]:
    if page < 0:
        page = 0

    return db_session.exec(
        select(Quiz)
        .where(Quiz.created_by_id == user_id)
        .offset(10 * page)
        .limit(10)
    ).all()


def get_quiz_by_id(*,
                   db_session: DBSession,
                   user_id: uuid.UUID,
                   quiz_id: uuid.UUID
                   ) -> Quiz | None:
    return db_session.exec(
        select(Quiz)
        .where(Quiz.id == quiz_id, Quiz.created_by_id == user_id)
    ).first()


def update_quiz(*,
                db_session: DBSession,
                quiz_id: uuid.UUID,
                user_id: uuid.UUID,
                quiz_in: QuizUpdate
                ) -> Quiz | None:
    current_quiz = get_quiz_by_id(db_session=db_session, quiz_id=quiz_id, user_id=user_id)
    if not current_quiz:
        return None

    old_questions = get_questions_by_quiz(
        db_session=db_session,
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
            db_session.delete(question)
        for question in new_questions:
            db_session.add(question)
        db_session.commit()
        db_session.refresh(current_quiz)

    except Exception as e:
        db_session.rollback()
        raise RuntimeError(f"Database error while updating quiz {quiz_id}: {e}") from e

    return current_quiz


def delete_quiz(*,
                db_session: DBSession,
                quiz_id: uuid.UUID,
                user_id: uuid.UUID
                ) -> bool:
    quiz = get_quiz_by_id(db_session=db_session, quiz_id=quiz_id, user_id=user_id)
    if not quiz:
        return False
    gamesession = db_session.exec(
        select(GameSession)
        .where(
            GameSession.quiz_id == quiz_id,
            GameSession.created_by_id == user_id
        )
    ).first()
    if gamesession:
        update_gamesession_quiz(
            db_session=db_session,
            quiz_id=None,
            user_id=user_id,
            gamesession_id=gamesession.id
        )

    db_session.delete(quiz)
    db_session.commit()
    return True

# ============= Question ==============


def create_question(*,
                    db_session: DBSession,
                    question_data: QuestionCreate,
                    user_id: uuid.UUID,
                    order: int | None = None,
                    ) -> Question | None:
    quiz = db_session.exec(
        select(Quiz).where(
            Quiz.id == question_data.quiz_id,
            Quiz.created_by_id == user_id
        )
    ).first()
    if not quiz:
        return None

    if order is None:
        max_order = db_session.exec(
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
    db_session.add(db_obj)
    db_session.commit()
    db_session.refresh(db_obj)
    return db_obj


def get_questions_by_quiz(*,
                          db_session: DBSession,
                          quiz_id: uuid.UUID,
                          user_id: uuid.UUID
                          ) -> list[Question]:
    quiz = db_session.exec(
        select(Quiz).where(
            Quiz.id == quiz_id,
            Quiz.created_by_id == user_id
        )
    ).first()
    if not quiz:
        return []
    return db_session.exec(
        select(Question)
        .where(Question.quiz_id == quiz_id)
        .order_by(Question.order)
    ).all()


def get_question_by_id(*,
                       db_session: DBSession,
                       question_id: uuid.UUID
                       ) -> Question | None:
    return db_session.exec(select(Question).where(Question.id == question_id)).first()


def delete_question(*,
                    db_session: DBSession,
                    question_id: uuid.UUID,
                    user_id: uuid.UUID
                    ) -> bool:
    question = get_question_by_id(db_session=db_session, question_id=question_id)
    if not question:
        return False
    quiz = db_session.exec(
        select(Quiz).where(
            Quiz.id == question.quiz_id,
            Quiz.created_by_id == user_id,
        )
    ).first()
    if not quiz:
        return False
    db_session.delete(question)
    db_session.commit()
    return True

# =========== GameSession =============


def create_gamesession(*,
                       db_session: DBSession,
                       user_id: uuid.UUID,
                       ) -> GameSession | None:
    existing_session = get_active_gamesession_by_user(
        db_session=db_session,
        user_id=user_id
    )
    if existing_session:
        return None

    max_attempts = 100
    for _ in range(max_attempts):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        existing = db_session.exec(
            select(GameSession).where(GameSession.code == code)
        ).first()
        if not existing:
            break
    else:
        raise RuntimeError(f"Failed to generate unique session code after {max_attempts} attempts")

    db_obj = GameSession(
        created_by_id=user_id,
        code=code,
        status=GameSessionStatusEnum.IDLE,
        question_number=0
    )
    db_session.add(db_obj)
    db_session.commit()
    db_session.refresh(db_obj)
    return db_obj


def get_gamesession_list(*,
                         db_session: DBSession,
                         user_id: uuid.UUID,
                         page: int
                         ) -> list[GameSession]:
    if page < 0:
        page = 0
    return db_session.exec(
        select(GameSession)
        .where(GameSession.created_by_id == user_id)
        .order_by(GameSession.created_at.desc())
        .offset(10 * page)
        .limit(10)
    ).all()


def get_gamesession_by_id(*,
                          db_session: DBSession,
                          user_id: uuid.UUID,
                          gamesession_id: uuid.UUID
                          ) -> GameSession | None:
    return db_session.exec(
        select(GameSession)
        .where(
            GameSession.id == gamesession_id,
            GameSession.created_by_id == user_id
        )
    ).first()


def get_gamesession_by_code(*,
                            db_session: DBSession,
                            code: str
                            ) -> GameSession | None:
    return db_session.exec(
        select(GameSession).where(GameSession.code == code)
    ).first()


def update_gamesession_status(*,
                              db_session: DBSession,
                              gamesession_id: uuid.UUID,
                              user_id: uuid.UUID,
                              status: GameSessionStatusEnum
                              ) -> GameSession | None:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        return None

    gamesession.status = status
    db_session.add(gamesession)
    db_session.commit()
    db_session.refresh(gamesession)
    return gamesession


def update_gamesession_question_number(*,
                                       db_session: DBSession,
                                       user_id: uuid.UUID,
                                       gamesession_id: uuid.UUID,
                                       question_number: int
                                       ) -> GameSession | None:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        return None

    gamesession.question_number = question_number
    db_session.add(gamesession)
    db_session.commit()
    db_session.refresh(gamesession)
    return gamesession


def update_gamesession_quiz(*,
                            db_session: DBSession,
                            user_id: uuid.UUID,
                            quiz_id: uuid.UUID | None,
                            gamesession_id: uuid.UUID,
                            ) -> GameSession | None:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game session not found or access denied"
        )

    if quiz_id:
        quiz = get_quiz_by_id(
            db_session=db_session,
            user_id=user_id,
            quiz_id=quiz_id
        )
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found or access denied"
            )

    gamesession.quiz_id = quiz_id
    gamesession.status = GameSessionStatusEnum.IDLE
    db_session.add(gamesession)
    db_session.commit()
    db_session.refresh(gamesession)
    return gamesession


def delete_gamesession(*,
                       db_session: DBSession,
                       gamesession_id: uuid.UUID,
                       user_id: uuid.UUID
                       ) -> bool:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        return False

    db_session.delete(gamesession)
    db_session.commit()
    return True


def get_active_gamesession_by_user(*,
                                   db_session: DBSession,
                                   user_id: uuid.UUID
                                   ) -> GameSession | None:
    return db_session.exec(
        select(GameSession)
        .where(
            GameSession.created_by_id == user_id,
            GameSession.status != GameSessionStatusEnum.INACTIVE,
        )
    ).first()


# =============== Player ===============


def create_player(*,
                  db_session: DBSession,
                  username: str,
                  code: str
                  ) -> Player | None:
    gamesession = get_gamesession_by_code(db_session=db_session, code=code)
    if not gamesession:
        return None
    if gamesession.status != GameSessionStatusEnum.IDLE:
        return None

    existing_player = db_session.exec(
        select(Player).where(
            Player.session_id == gamesession.id,
            Player.username == username
        )
    ).first()
    if existing_player:
        return None

    db_obj = Player(
        username=username,
        session_id=gamesession.id
    )
    db_session.add(db_obj)
    db_session.commit()
    db_session.refresh(db_obj)
    return db_obj


def get_players_by_gamesession(*,
                               db_session: DBSession,
                               gamesession_id: uuid.UUID,
                               user_id: uuid.UUID
                               ) -> list[Player]:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        return []

    return db_session.exec(
        select(Player)
        .where(Player.session_id == gamesession_id)
        .order_by(Player.created_at)
    ).all()


def get_player_by_id(*,
                     db_session: DBSession,
                     player_id: uuid.UUID
                     ) -> Player | None:
    return db_session.exec(
        select(Player).where(Player.id == player_id)
    ).first()


def get_player_by_username_in_session(*,
                                      db_session: DBSession,
                                      gamesession_id: uuid.UUID,
                                      username: str
                                      ) -> Player | None:
    return db_session.exec(
        select(Player).where(
            Player.session_id == gamesession_id,
            Player.username == username
        )
    ).first()


def delete_player(*,
                  db_session: DBSession,
                  player_id: uuid.UUID,
                  gamesession_id: uuid.UUID,
                  user_id: uuid.UUID
                  ) -> bool:
    gamesession = get_gamesession_by_id(
        db_session=db_session,
        user_id=user_id,
        gamesession_id=gamesession_id
    )
    if not gamesession:
        return False

    player = get_player_by_id(
        db_session=db_session,
        player_id=player_id
    )
    if not player or player.session_id != gamesession_id:
        return False

    db_session.delete(player)
    db_session.commit()
    return True


def kick_player(*,
                db_session: DBSession,
                code: str,
                player_id: uuid.UUID
                ) -> bool:
    gamesession = get_gamesession_by_code(
        db_session=db_session,
        code=code
    )
    if not gamesession:
        return False

    player = get_player_by_id(
        db_session=db_session,
        player_id=player_id
    )
    if not player or player.session_id != gamesession.id:
        return False

    db_session.delete(player)
    db_session.commit()
    return True


def get_player_count(*,
                     db_session: DBSession,
                     session_id: uuid.UUID
                     ) -> int:
    result = db_session.exec(
        select(func.count()).where(Player.session_id == session_id)
    ).one()
    return result or 0


def set_player_chosen_answer(*,
                             db_session: DBSession,
                             player_id: uuid.UUID,
                             answer_index: int,
                             ) -> bool:
    player = get_player_by_id(db_session=db_session, player_id=player_id)
    if not player:
        return False
    player.chosen_answer = answer_index
    db_session.add(player)
    db_session.commit()
    return True


def reset_all_players_chosen_answers(*,
                                     db_session: DBSession,
                                     session_id: uuid.UUID,
                                     ) -> None:
    players = db_session.exec(
        select(Player).where(Player.session_id == session_id)
    ).all()
    for p in players:
        p.chosen_answer = None
        db_session.add(p)
    db_session.commit()


def add_points_for_current_question(*,
                                    db_session: DBSession,
                                    session_id: uuid.UUID,
                                    correct_answer_index: int,
                                    points_per_correct: int = 100,
                                    ) -> AnswerValidationResult:
    players = db_session.exec(
        select(Player).where(Player.session_id == session_id)
    ).all()
    res = AnswerValidationResult()
    for p in players:
        if p.chosen_answer == correct_answer_index:
            p.score += points_per_correct
            res.correct_answers += 1
            db_session.add(p)
        res.all_answers += 1
    db_session.commit()
    return res
