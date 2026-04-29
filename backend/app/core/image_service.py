from io import BytesIO

from minio.error import S3Error

from app.constants import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE
from app.core.minio import minio_client


class ImageService:
    BUCKET_NAME = "balkon-quiz"

    @staticmethod
    def _get_extension(content_type: str) -> str:
        mime_to_ext = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        }
        return mime_to_ext.get(content_type, "jpg")

    @classmethod
    def upload(cls, image_id: str, file_data: bytes, content_type: str) -> bool:
        if len(file_data) > MAX_UPLOAD_SIZE:
            raise ValueError(f"File too large. Max {MAX_UPLOAD_SIZE / 1024 / 1024:.1f}MB")

        if content_type not in ALLOWED_IMAGE_TYPES:
            raise ValueError(f"Invalid file type. Allowed: {ALLOWED_IMAGE_TYPES}")

        ext = cls._get_extension(content_type)
        object_name = f"{image_id}.{ext}"

        try:
            minio_client.put_object(
                bucket_name=cls.BUCKET_NAME,
                object_name=object_name,
                data=BytesIO(file_data),
                length=len(file_data),
                content_type=content_type,
            )
            return True
        except S3Error:
            return False

    @classmethod
    def get(cls, image_id: str) -> tuple[bytes, str] | None:
        for ext in ["jpg", "jpeg", "png", "webp"]:
            object_name = f"{image_id}.{ext}"
            try:
                response = minio_client.get_object(
                    bucket_name=cls.BUCKET_NAME, object_name=object_name
                )
                file_data = response.read()
                content_type = response.headers.get("content-type", "image/jpeg")
                response.close()
                return file_data, content_type
            except S3Error:
                continue
        return None

    @classmethod
    def delete(cls, image_id: str) -> bool:
        for ext in ["jpg", "jpeg", "png", "webp"]:
            object_name = f"{image_id}.{ext}"
            try:
                minio_client.remove_object(
                    bucket_name=cls.BUCKET_NAME, object_name=object_name
                )
                return True
            except S3Error:
                continue
        return False
