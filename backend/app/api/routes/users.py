from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Response, HTTPException

from app.core.config import settings
from app.core import security
from app import crud
from app.api.deps import (
    CurrentUserDep,
    SessionDep,
)
from app.models import (
    UserRegister,
    UserPublic,
    AuthResponse,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/singin", response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserRegister) -> Any:
    """
    Register user
    """
    user = crud.get_user_by_name(session=session, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail=f'User with username "{user_in.username}" already exists',
        )

    user = crud.create_user(session=session, user_create=user_in)
    return user


@router.post("/login", response_model=AuthResponse)
def login_user(
    *,
    session: SessionDep,
    user_in: UserRegister,
    response: Response,
) -> Any:
    """
    Login
    """
    user = crud.authenticate(
        session=session, username=user_in.username, password=user_in.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        user.id, expires_delta=access_token_expires
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


@router.post("/user/logout")
def user_logout(
    response: Response,
    session: SessionDep,
) -> Any:

    response.set_cookie(
        key="access_token",
        value="( . Y . ) <-- BOOBS",  # why are you reading this?
        httponly=True,  # no java access
        secure=False,  # set True in HTTPS prod
        samesite="strict",
        max_age=1
    )

    return {"status": True}


@router.get("/me", response_model=UserPublic)
def read_user_me(*, current_user: CurrentUserDep) -> Any:
    """
    Get current user.
    """
    return current_user
