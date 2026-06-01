import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.image_service import ImageService

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/upload")
async def upload_image(file: UploadFile | None = File(None)) -> dict:
    if not file:
        return {"image_id": None, "url": None}

    image_id = str(uuid.uuid4())
    file_content = await file.read()

    try:
        success = ImageService.upload(
            image_id=image_id,
            file_data=file_content,
            content_type=file.content_type or "image/jpeg",
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to save image",
            )
        return {"image_id": image_id, "url": f"{settings.API_V1_STR}/images/{image_id}"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{image_id}")
async def get_image(image_id: str) -> StreamingResponse:
    image_data = ImageService.get(image_id)
    if not image_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    file_data, content_type = image_data
    return StreamingResponse(iter([file_data]), media_type=content_type)

