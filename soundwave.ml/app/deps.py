"""
Dependency injection для FastAPI.

Все тяжёлые объекты (модель, БД, векторный индекс) создаются один раз
в lifespan и хранятся в app.state. Routes получают их через зависимости.
"""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, Request, status

from app.config import Settings, get_settings
from app.domain.audio.loader import AudioLoader
from app.domain.callback import DotNetCallback
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.storage.db import MusicDB
from app.domain.storage.vector_store import VectorStore


def get_db(request: Request) -> MusicDB:
    return request.app.state.db


def get_vector_store(request: Request) -> VectorStore:
    return request.app.state.vector_store


def get_audio_loader(request: Request) -> AudioLoader:
    return request.app.state.audio_loader


def get_embedding_engine(request: Request) -> EmbeddingEngine:
    return request.app.state.embedding_engine


def get_callback(request: Request) -> DotNetCallback:
    return request.app.state.callback


def verify_internal_token(
    x_internal_token: str = Header(..., alias="X-Internal-Token"),
    settings: Settings = Depends(get_settings),
) -> None:
    """Проверяет shared secret между .NET и Python-сервисами."""
    if x_internal_token != settings.internal_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal token",
        )
