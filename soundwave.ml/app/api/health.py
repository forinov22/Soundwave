from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.deps import get_db, get_vector_store
from app.domain.storage.db import MusicDB
from app.domain.storage.vector_store import VectorStore

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    tracks_total: int
    fingerprints_total: int
    embeddings_total: int


@router.get("/health", response_model=HealthResponse, summary="Статус сервиса")
def health(
    db: MusicDB = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
):
    return HealthResponse(
        status="ok",
        tracks_total=db.count_tracks(),
        fingerprints_total=db.count_fingerprints(),
        embeddings_total=vector_store.count(),
    )
