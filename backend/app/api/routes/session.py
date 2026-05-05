import uuid
import random
import string
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, HTTPException, status, Response

from app import crud
from app.core import security
from app.core.config import settings
from app.models import (
    GameSessionCreate,
)
from app.api.deps import (
    DBSessionDep,
    CurrentUserDep,
    OptionalCurrentUserDep,
    OptionalCurrentPlayerDep,
)
from app.enums import GameSessionStatusEnum


router = APIRouter(prefix="/session", tags=["session"])


@router.post("/create", response_model=GameSessionCreate)
def create_session(*,
                   db_session: DBSessionDep,
                   current_user: CurrentUserDep,
                   ) -> Any:
    active_session = crud.get_active_gamesession_by_user(
        db_session=db_session,
        user_id=current_user.id
    )
    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active session"
        )

    new_session = crud.create_gamesession(
        db_session=db_session,
        user_id=current_user.id,
    )
    if not new_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create session"
        )

    return GameSessionCreate(id=new_session.id)


@router.get("/status")
def get_session_status(*,
                       db_session: DBSessionDep,
                       current_user: OptionalCurrentUserDep,
                       current_player: OptionalCurrentPlayerDep,
                       ) -> Any:
    user_id = None
    player_id = None

    if current_user:
        user_id = current_user.id
        gamesession = crud.get_active_gamesession_by_user(
            db_session=db_session,
            user_id=user_id
        )
    elif current_player:
        try:
            player = crud.get_player_by_id(
                db_session=db_session,
                player_id=current_player.id)
            gamesession = player.current_gamesession
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid player session cookie"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    if not gamesession:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found"
        )

    quiz = crud.get_quiz_by_id(
        db_session=db_session,
        user_id=gamesession.created_by_id,
        quiz_id=gamesession.quiz_id
    ) if gamesession.quiz_id else None
    players_count = crud.get_player_count(
        db_session=db_session,
        session_id=gamesession.id
    )
    player_score = 0
    if player_id:
        pass

    response_data = {
        "code": gamesession.code,
        "status": gamesession.status,
        "question_number": gamesession.question_number,
        "players_count": players_count,
        "score": player_score,
        "total_questions": len(quiz.questions) if quiz else 0,
        "quiz_id": gamesession.quiz_id,
    }
    if gamesession.status == GameSessionStatusEnum.QUESTION:
        if quiz and gamesession.question_number < len(quiz.questions):
            question = quiz.questions[gamesession.question_number]
            response_data["question"] = {
                "id": question.id,
                "title": question.title,
                "img": question.img,
                "answers": [
                    question.answer0,
                    question.answer1,
                    question.answer2,
                    question.answer3
                ]
            }
    elif gamesession.status == GameSessionStatusEnum.QUESTION_WITH_ANSWERS:
        if quiz and gamesession.question_number < len(quiz.questions):
            question = quiz.questions[gamesession.question_number]
            response_data["question"] = {
                "id": question.id,
                "title": question.title,
                "img": question.img,
                "answers": [
                    question.answer0,
                    question.answer1,
                    question.answer2,
                    question.answer3
                ]
            }
            response_data["correct_answer"] = question.correct
    elif gamesession.status == GameSessionStatusEnum.RANKING:
        pass
    elif gamesession.status == GameSessionStatusEnum.LEADERBOARD:
        pass

    return response_data


@router.delete("/")
def delete_gamesession(*,
                       db_session: DBSessionDep,
                       current_user: CurrentUserDep
                       ):
    gamesession = crud.get_user_by_id(db_session=db_session, user_id=current_user.id).gamesession_created

    success = crud.delete_gamesession(
        db_session=db_session,
        gamesession_id=gamesession.id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )
    return {"message": "Session deleted successfully"}


@router.get("/player/list")
def get_players_list(*,
                     db_session: DBSessionDep,
                     current_user: OptionalCurrentUserDep,
                     current_player: OptionalCurrentPlayerDep,
                     ) -> Any:
    if current_user:
        user_id = current_user.id
        gamesession = crud.get_active_gamesession_by_user(
            db_session=db_session,
            user_id=user_id
        )
    elif current_player:
        try:
            player = crud.get_player_by_id(
                db_session=db_session,
                player_id=current_player.id)
            gamesession = player.current_gamesession
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid player session cookie"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    players = crud.get_players_by_gamesession(
        db_session=db_session,
        gamesession_id=gamesession.id,
        user_id=gamesession.created_by_id
    )

    return [
        {
            "id": player.id,
            "username": player.username,
            "score": 0,
            "joined_at": player.created_at
        }
        for player in players
    ]


@router.post("/player/{player_id}/kick")
def kick_player(*,
                db_session: DBSessionDep,
                current_user: CurrentUserDep,
                player_id: uuid.UUID
                ) -> Any:
    gamesession = crud.get_player_by_id(db_session=db_session, player_id=player_id).current_gamesession

    success = crud.kick_player(
        db_session=db_session,
        session_code=gamesession.code,
        player_id=player_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found in current session"
        )
    return {"message": "Player kicked successfully"}


@router.post("/join")
def join_session(*,
                 db_session: DBSessionDep,
                 response: Response,
                 session_code: str,
                 username: str | None,
                 ) -> Any:
    if not username:
        username = f"Player_{''.join(random.choices(string.digits, k=4))}"

    player = crud.create_player(
        db_session=db_session,
        username=username,
        code=session_code
    )

    if not player:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to join session. Session may be full or already started"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        subject=player.id,
        is_user=False,
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,  # no java access
        secure=False,  # set True in HTTPS prod
        samesite="strict",
        max_age=int(access_token_expires.total_seconds())
    )

    return {
        "message": "Joined successfully",
        "player_id": player.id,
        "username": username,
        "session_code": session_code
    }


@router.post("/quiz")
def set_session_quiz(*,
                     db_session: DBSessionDep,
                     current_user: CurrentUserDep,
                     quiz_id: uuid.UUID
                     ) -> Any:
    gamesession = crud.get_active_gamesession_by_user(db_session=db_session, user_id=current_user.id)
    crud.update_gamesession_quiz(
        db_session=db_session,
        user_id=current_user.id,
        quiz_id=quiz_id,
        gamesession_id=gamesession.id,
    )
    return {"message": "Quiz selected successfully"}


@router.delete("/quiz")
def remove_session_quiz(*,
                        db_session: DBSessionDep,
                        current_user: CurrentUserDep,
                        ) -> Any:
    gamesession = crud.get_active_gamesession_by_user(db_session=db_session, user_id=current_user.id)
    crud.update_gamesession_quiz(
        db_session=db_session,
        user_id=current_user.id,
        quiz_id=None,
        gamesession_id=gamesession.id
    )
    return {"message": "Quiz removed, session set to IDLE"}


@router.post("/progress")
def session_progress(*,
                     db_session: DBSessionDep,
                     current_user: CurrentUserDep
                     ) -> Any:
    gamesession = crud.get_active_gamesession_by_user(db_session=db_session, user_id=current_user.id)

    if not gamesession.quiz_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No quiz selected for this session"
        )

    quiz = crud.get_quiz_by_id(
        db_session=db_session,
        user_id=current_user.id,
        quiz_id=gamesession.quiz_id
    )
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    total_questions = len(quiz.questions)
    current_status = gamesession.status
    current_question_num = gamesession.question_number
    if total_questions == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz has no questions"
        )

    if current_status == GameSessionStatusEnum.IDLE:
        gamesession.status = GameSessionStatusEnum.QUESTION
        gamesession.question_number = 0
    elif current_status == GameSessionStatusEnum.QUESTION:
        gamesession.status = GameSessionStatusEnum.QUESTION_WITH_ANSWERS
    elif current_status == GameSessionStatusEnum.QUESTION_WITH_ANSWERS:
        gamesession.status = GameSessionStatusEnum.RANKING
    elif current_status == GameSessionStatusEnum.RANKING:
        if current_question_num + 1 < total_questions:
            gamesession.status = GameSessionStatusEnum.QUESTION
            gamesession.question_number += 1
        else:
            gamesession.status = GameSessionStatusEnum.LEADERBOARD
    elif current_status == GameSessionStatusEnum.LEADERBOARD:
        gamesession.status = GameSessionStatusEnum.IDLE
        gamesession.question_number = 0
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status for progression: {current_status}"
        )

    db_session.add(gamesession)
    db_session.commit()
    db_session.refresh(gamesession)

    return gamesession
