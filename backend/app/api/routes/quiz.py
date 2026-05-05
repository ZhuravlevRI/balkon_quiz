import uuid
from typing import Any
from fastapi import APIRouter, HTTPException, status

from app import crud
from app.models import (
    Quiz,
    QuizCreate,
    QuizUpdate,
    QuizWithQuestions,
    QuizResponse,
)
from app.api.deps import (
    DBSessionDep,
    CurrentUserDep,
)


router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/create", response_model=QuizCreate)
def create_quiz(*,
                db_session: DBSessionDep,
                current_user: CurrentUserDep
                ) -> Any:
    new_quiz = crud.create_quiz(
        db_session=db_session,
        user_id=current_user.id
    )
    return QuizCreate(id=new_quiz.id)


@router.get("/list", response_model=list[QuizResponse])
def list_quiz(*,
              db_session: DBSessionDep,
              current_user: CurrentUserDep,
              page: int = 0
              ) -> Any:
    quizzes = crud.get_quiz_list(
        db_session=db_session,
        user_id=current_user.id,
        page=page
    )
    return quizzes


@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz(*,
             db_session: DBSessionDep,
             quiz_id: uuid.UUID,
             current_user: CurrentUserDep
             ) -> Any:
    quiz = crud.get_quiz_by_id(db_session=db_session, user_id=current_user.id, quiz_id=quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or access denied"
        )
    return quiz


@router.put("/{quiz_id}", response_model=Quiz)
def update_quiz(*,
                quiz_id: uuid.UUID,
                quiz_in: QuizUpdate,
                db_session: DBSessionDep,
                current_user: CurrentUserDep
                ) -> Any:
    quiz = crud.update_quiz(
        db_session=db_session,
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
def delete_quiz(*,
                quiz_id: uuid.UUID,
                db_session: DBSessionDep,
                current_user: CurrentUserDep
                ) -> Any:
    success = crud.delete_quiz(db_session=db_session, quiz_id=quiz_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or access denied"
        )
    return {"message": "Quiz deleted successfully"}
