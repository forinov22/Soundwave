"""
Эндпоинты управления треками.

POST /tracks/{track_id}/process   — запустить обработку (fingerprint + embedding)
GET  /tracks/{track_id}/status    — получить статус
DELETE /tracks/{track_id}         — удалить из всех хранилищ
"""

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel

from app.deps import (
    get_audio_loader,
    get_callback,
    get_db,
    get_embedding_engine,
    get_vector_store,
    verify_internal_token,
)
from app.domain.audio.loader import AudioLoader
from app.domain.callback import DotNetCallback
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.storage.db import MusicDB, ProcessingStatus
from app.domain.storage.vector_store import VectorStore
from app.domain.worker import process_track

router = APIRouter(prefix="/tracks", tags=["tracks"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProcessRequest(BaseModel):
    s3_key: str   # ключ файла в S3, например "audio/tracks/abc123.mp3"


class StatusResponse(BaseModel):
    track_id: str
    status: str
    error: str | None = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/{track_id}/process",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(verify_internal_token)],
    summary="Запустить обработку трека (fingerprint + embedding)",
)
async def process(
    track_id: str,
    body: ProcessRequest,
    background_tasks: BackgroundTasks,
    db: MusicDB = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
    audio_loader: AudioLoader = Depends(get_audio_loader),
    embedding_engine: EmbeddingEngine = Depends(get_embedding_engine),
    callback: DotNetCallback = Depends(get_callback),
):
    # Создаём запись со статусом pending (или обновляем если уже есть)
    db.get_or_create_track(track_id)

    # Функция обратного вызова — bound к текущим зависимостям
    async def callback_fn(ext_id: str, success: bool, error_msg: str | None):
        await callback.notify(ext_id, success, error_msg)

    background_tasks.add_task(
        process_track,
        external_track_id=track_id,
        s3_key=body.s3_key,
        db=db,
        vector_store=vector_store,
        audio_loader=audio_loader,
        embedding_engine=embedding_engine,
        callback_fn=callback_fn,
    )

    return {"track_id": track_id, "status": "processing", "message": "Processing started"}


@router.get(
    "/{track_id}/status",
    response_model=StatusResponse,
    dependencies=[Depends(verify_internal_token)],
    summary="Получить статус обработки трека",
)
def get_status(
    track_id: str,
    db: MusicDB = Depends(get_db),
):
    track = db.get_track(track_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return StatusResponse(track_id=track_id, status=track.status, error=track.error)


@router.delete(
    "/{track_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_internal_token)],
    summary="Удалить трек из всех хранилищ (fingerprints + embedding)",
)
def delete_track(
    track_id: str,
    db: MusicDB = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
):
    deleted_db = db.delete_track(track_id)
    deleted_vec = vector_store.remove(track_id)

    if not deleted_db and not deleted_vec:
        raise HTTPException(status_code=404, detail="Track not found")
