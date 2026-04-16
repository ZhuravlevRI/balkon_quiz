from fastapi import APIRouter, HTTPException, status
import uuid

from app import crud
from app.models import QuestionCreate, QuestionResponse
from app.api.deps import SessionDep, CurrentUserDep

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/", response_model=QuestionResponse)
def create_question(
    question_in: QuestionCreate,
    session: SessionDep,
    current_user: CurrentUserDep
):
    db_question = crud.create_question(
        session=session,
        question_data=question_in,
        user_id=current_user.id
    )
    if db_question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or you don't have permission to add questions"
        )
    return db_question


@router.get("/quiz/{quiz_id}", response_model=list[QuestionResponse])
def get_questions(
    quiz_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUserDep
):
    questions = crud.get_questions_by_quiz(
        session=session,
        quiz_id=quiz_id,
        user_id=current_user.id
    )
    if questions is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Quiz not found or access denied"
        )
    return questions
