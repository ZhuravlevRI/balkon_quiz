import uuid
from typing import Any
from fastapi import APIRouter, HTTPException, status

from app import crud
from app.models import (
    Quiz,
    QuizCreate,
    QuizUpdate,
    QuizBase,
    QuizWithQuestions,
    QuizResponse,
)
from app.api.deps import (
    SessionDep,
    CurrentUserDep,
)


router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post(
    "/create",
    response_model=QuizCreate
)
def create_quiz(*, session: SessionDep, current_user: CurrentUserDep) -> Any:
    """
    Create quiz
    return QuizCreate with id
    """
    new_quiz = crud.create_quiz(session=session, user_id=current_user.id)
    return QuizCreate(id=new_quiz.id)


@router.get(
    "/list",
    response_model=list[QuizResponse]
)
def list_quiz(*, session: SessionDep, current_user: CurrentUserDep, page: int = 0) -> Any:
    """
    List quiz with pagination
    """
    quizzes = crud.get_quiz_list(session=session, user_id=current_user.id, page=page)
    return quizzes


@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz(
    quiz_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUserDep
):
    """
    Get Quiz
    """
    quiz = crud.get_quiz_by_id(session=session, user_id=current_user.id, quiz_id=quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or access denied"
        )
    return quiz


@router.put("/{quiz_id}", response_model=Quiz)
def update_quiz(
    quiz_id: uuid.UUID,
    quiz_in: QuizUpdate,
    session: SessionDep,
    current_user: CurrentUserDep
):
    """
    Update Quiz
    """
    quiz = crud.update_quiz(
        session=session,
        quiz_id=quiz_id,
        user_id=current_user.id,
        quiz_in=quiz_in,
    )
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or you don't have permission"
        )
    return quiz


@router.delete("/{quiz_id}")
def delete_quiz(
    quiz_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUserDep
):
    success = crud.delete_quiz(session=session, quiz_id=quiz_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or access denied"
        )
    return {"message": "Quiz deleted successfully"}
