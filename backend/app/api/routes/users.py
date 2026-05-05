from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Response, HTTPException

from app.core.config import settings
from app.core import security
from app import crud
from app.api.deps import (
    DBSessionDep,
    CurrentUserDep,
)
from app.models import (
    UserRegister,
    UserPublic,
    AuthResponse,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/singin", response_model=UserPublic)
def create_user(*,
                db_session: DBSessionDep,
                user_in: UserRegister
                ) -> Any:
    user = crud.get_user_by_name(db_session=db_session, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail=f'User with username "{user_in.username}" already exists',
        )

    user = crud.create_user(db_session=db_session, user_create=user_in)
    return user


@router.post("/login", response_model=AuthResponse)
def login_user(*,
               db_session: DBSessionDep,
               user_in: UserRegister,
               response: Response,
               ) -> Any:
    user = crud.authenticate(
        db_session=db_session,
        username=user_in.username,
        password=user_in.password,
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        subject=user.id,
        is_user=True,
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

    return AuthResponse(is_auth_good=True)


@router.post("/logout")
def user_logout(*,
                response: Response,
                ) -> Any:

    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,  # no java access
        secure=False,  # set True in HTTPS prod
        samesite="strict",
        max_age=1
    )

    return {"status": True}


@router.get("/me", response_model=UserPublic)
def read_user_me(*,
                 current_user: CurrentUserDep
                 ) -> Any:
    return current_user
