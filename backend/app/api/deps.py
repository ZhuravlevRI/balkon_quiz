from typing import Optional
from typing import Annotated

from fastapi import Depends, Request, HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param

from sqlmodel import Session

import jwt
from jwt.exceptions import InvalidTokenError

from app.core.db import get_session
from app.crud import get_user_by_id
from app.core.config import settings
from app.models import User, UserPublic


SessionDep = Annotated[Session, Depends(get_session)]


async def get_token_from_cookie(request: Request) -> Optional[str]:
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


TokenDep = Annotated[Optional[str], Depends(get_token_from_cookie)]


async def get_current_user(
    *,
    session: Session = Depends(get_session),
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
        if user_id is None:
            raise cred_exc
    except InvalidTokenError:
        raise cred_exc

    user = get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise cred_exc

    return user

    # return UserPublic(
    #     id=user.id,
    #     username=user.username,
    #     is_active=user.is_active,
    #     created_at=user.created_at
    # )


CurrentUserDep = Annotated[UserPublic, Depends(get_current_user)]
