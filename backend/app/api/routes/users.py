from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def read_user_me() -> Any:
    """
    Minimal user endpoint
    """
    return {"username": "demo-user",
            "is_active": True,
            }
