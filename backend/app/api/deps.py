from typing import Optional
from typing import Annotated

from fastapi import Depends, Request, HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param

from sqlmodel import Session as DBSession

import jwt
from jwt.exceptions import InvalidTokenError

from app.core.db import get_db_session
from app.crud import (
    get_user_by_id,
    get_player_by_id,
    get_active_gamesession_by_user,
)
from app.core.config import settings
from app.models import (
    User,
    UserPublic,
    Player,
    PlayerPublic,
    GameSession,
)


def get_token_from_cookie(request: Request) -> Optional[str]:
    """
    Get auth token from cookie
    format:
    access_token="Bearer {token}"
    or
    access_token="{token}"
    """
    cookie_value: str = request.cookies.get("access_token")
    if not cookie_value:
        return None

    scheme, param = get_authorization_scheme_param(cookie_value)
    if scheme.lower() == "bearer":
        return param
    return cookie_value


def get_current_user(
    *,
    db_session: DBSession = Depends(get_db_session),
    token: Optional[str] = Depends(get_token_from_cookie),
) -> User:

    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise cred_exc

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: Optional[str] = payload.get("sub")
        is_user: Optional[str] = payload.get("is_user")
        if user_id is None:
            raise cred_exc
        if is_user != "True":
            raise cred_exc
    except InvalidTokenError:
        raise cred_exc

    user = get_user_by_id(db_session=db_session, user_id=user_id)
    if not user:
        raise cred_exc

    return user


def optional_get_current_user(
    *,
    db_session: DBSession = Depends(get_db_session),
    token: Optional[str] = Depends(get_token_from_cookie),
) -> User | None:
    try:
        return get_current_user(db_session=db_session, token=token)
    except HTTPException:
        return None


def get_current_player(
    *,
    db_session: DBSession = Depends(get_db_session),
    token: Optional[str] = Depends(get_token_from_cookie),
) -> Player:

    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not join session",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise cred_exc

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        player_id: Optional[str] = payload.get("sub")
        is_user: Optional[str] = payload.get("is_user")
        if is_user == "True":
            raise cred_exc
        if player_id is None:
            raise cred_exc
    except InvalidTokenError:
        raise cred_exc

    player = get_player_by_id(db_session=db_session, player_id=player_id)
    if not player:
        raise cred_exc
    return player


def optional_get_current_player(
    *,
    db_session: DBSession = Depends(get_db_session),
    token: Optional[str] = Depends(get_token_from_cookie),
) -> Player | None:
    try:
        return get_current_player(db_session=db_session, token=token)
    except HTTPException:
        return None


def get_current_session(
    db_session: DBSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> GameSession:
    current_gamesession = get_active_gamesession_by_user(
        db_session=db_session,
        user_id=user.id
    )
    if not current_gamesession:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found"
        )
    return current_gamesession


GameSessionDep = Annotated[
    GameSession,
    Depends(get_current_session),
]


DBSessionDep = Annotated[
    DBSession,
    Depends(get_db_session),
]
TokenDep = Annotated[
    Optional[str],
    Depends(get_token_from_cookie),
]
CurrentUserDep = Annotated[
    UserPublic,
    Depends(get_current_user),
]
OptionalCurrentUserDep = Annotated[
    UserPublic,
    Depends(optional_get_current_user),
]
CurrentPlayerDep = Annotated[
    PlayerPublic,
    Depends(get_current_player),
]
OptionalCurrentPlayerDep = Annotated[
    PlayerPublic,
    Depends(optional_get_current_player),
]
