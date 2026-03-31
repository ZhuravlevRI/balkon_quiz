# TODO
# quiz/list - возращает список квизов текущего пользователя, имеет пагинацию, квизы возрашаются без вопросов
# quiz/<id> - возращает квиз полностью текущему пользователю (игрокам ничего не возращает)
# quiz/<id> PUT - обновляет квиз, я вам кидаю JSON
# quiz/<id> DELETE - удаляет квиз

from typing import Any

from fastapi import APIRouter

from app import crud
from app.models import (
    Quiz,
    QuizNew,
    QuizBase,
)
from app.api.deps import (
    SessionDep,
    CurrentUserDep,
)


router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post(
    "/create",
    response_model=QuizNew
)
def create_quiz(*, session: SessionDep, current_user: CurrentUserDep) -> Any:
    """
    Create quiz
    return QuizNew with id
    """
    new_quiz = crud.create_quiz(session=session, user_id=current_user.id)
    return QuizNew(id=new_quiz.id)


@router.get(
    "/list",
    response_model=list[QuizBase]
)
def list_quiz(*, session: SessionDep, current_user: CurrentUserDep, page: int) -> Any:
    """
    List quiz with pagination
    """
    quizes = crud.get_quiz_list(session=session, user_id=current_user.id, page=page)
    return [
        QuizBase(
            id=el.id,
            title=el.title,
            description=el.description
        )
        for el in quizes
    ]
