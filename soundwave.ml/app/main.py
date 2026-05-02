"""
Точка входа FastAPI-сервиса.

lifespan:
  - Создаём data/ директорию если нет.
  - Инициализируем SQLite (MusicDB создаёт схему сам).
  - Загружаем hnswlib-индекс.
  - Загружаем ML-модель (самая тяжёлая операция — ~1-2с на CPU).
  - Создаём AudioLoader и DotNetCallback.
  - Всё кладём в app.state — routes достают через deps.py.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI

from app.api import health, recognize, similar, tracks
from app.config import get_settings
from app.domain.audio.loader import AudioLoader
from app.domain.callback import DotNetCallback
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.storage.db import MusicDB
from app.domain.storage.vector_store import VectorStore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    # Создаём директории если нет
    Path(settings.data_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.models_dir).mkdir(parents=True, exist_ok=True)

    logger.info("Initializing SQLite DB at %s", settings.db_path)
    db = MusicDB(settings.db_path)

    logger.info("Loading hnswlib index from %s", settings.hnsw_index_path)
    vector_store = VectorStore(
        index_path=settings.hnsw_index_path,
        labels_path=settings.hnsw_labels_path,
        embedding_size=settings.embedding_size,
    )

    logger.info("Loading ML model from %s", settings.model_path)
    embedding_engine = EmbeddingEngine(
        model_path=settings.model_path,
        device=settings.device,
        n_mels=settings.n_mels,
        embedding_size=settings.embedding_size,
        target_sr=settings.target_sr,
    )
    logger.info("Model loaded. Embedding size: %d", embedding_engine.embedding_size)

    audio_loader = AudioLoader(settings)
    callback = DotNetCallback(settings)

    # Кладём всё в app.state — deps.py достанет это из request.app.state
    app.state.db = db
    app.state.vector_store = vector_store
    app.state.embedding_engine = embedding_engine
    app.state.audio_loader = audio_loader
    app.state.callback = callback

    logger.info("Soundwave ML service ready on %s:%d", settings.host, settings.port)
    yield

    # Shutdown
    await callback.close()
    logger.info("Service shutdown complete")


app = FastAPI(
    title="Soundwave ML Service",
    description=(
        "Сервис для fingerprint-распознавания треков (Shazam-алгоритм) "
        "и ML-рекомендаций на основе эмбеддингов."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(tracks.router)
app.include_router(recognize.router)
app.include_router(similar.router)
app.include_router(health.router)


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )
