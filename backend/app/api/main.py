from fastapi import APIRouter

from app.api.routes import (
    images,
    questions,
    quiz,
    users,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(images.router)
api_router.include_router(users.router)
api_router.include_router(quiz.router)
api_router.include_router(questions.router)


if settings.ENVIRONMENT == "local":
    pass
