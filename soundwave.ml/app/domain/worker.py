"""
Воркер обработки трека: запускается в фоне (FastAPI BackgroundTasks).

Пайплайн:
  1. Скачать аудио из S3 по ключу.
  2. Параллельно вычислить fingerprint и embedding (оба CPU-bound, используем threadpool).
  3. Сохранить fingerprints в SQLite, embedding в hnswlib.
  4. Обновить статус трека в БД.
  5. Отправить callback в .NET.

Почему threadpool а не asyncio.gather с run_in_executor:
  fingerprint и embedding — тяжёлые CPU-операции с numpy/torch.
  В FastAPI с asyncio их запускать в executor всё равно нужно,
  иначе заблокируют event loop. Используем concurrent.futures.ThreadPoolExecutor.
"""

from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

import numpy as np

from app.domain.audio.loader import AudioLoader
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.fingerprint.core import fingerprint_samples
from app.domain.storage.db import MusicDB, ProcessingStatus
from app.domain.storage.vector_store import VectorStore

logger = logging.getLogger(__name__)

# Один пул на весь процесс — не создаём при каждом запросе
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="ml-worker")


async def process_track(
    external_track_id: str,
    s3_key: str,
    db: MusicDB,
    vector_store: VectorStore,
    audio_loader: AudioLoader,
    embedding_engine: EmbeddingEngine,
    callback_fn,  # async callable(external_track_id, success, error_msg)
) -> None:
    """
    Основная функция обработки. Вызывается как BackgroundTask.
    """
    logger.info("Processing track %s (s3_key=%s)", external_track_id, s3_key)
    db.set_status(external_track_id, ProcessingStatus.PROCESSING)

    try:
        # 1. Загрузка из S3 (IO-bound, в executor чтобы не блокировать loop)
        loop = asyncio.get_running_loop()
        waveform: np.ndarray = await loop.run_in_executor(
            _executor,
            audio_loader.load_from_s3,
            s3_key,
        )

        # 2. Параллельно: fingerprint + embedding (оба CPU-bound)
        fingerprint_future = loop.run_in_executor(
            _executor,
            fingerprint_samples,
            waveform,
        )
        embedding_future = loop.run_in_executor(
            _executor,
            embedding_engine.embed,
            waveform,
        )
        hashes, embedding = await asyncio.gather(fingerprint_future, embedding_future)

        logger.info(
            "Track %s: %d fingerprints, embedding shape %s",
            external_track_id, len(hashes), embedding.shape,
        )

        # 3. Сохраняем результаты
        track = db.get_or_create_track(external_track_id)
        db.add_fingerprints(track.internal_id, hashes)

        hnsw_label = vector_store.add(external_track_id, embedding)
        db.set_hnsw_label(external_track_id, hnsw_label)

        # 4. Обновляем статус
        db.set_status(external_track_id, ProcessingStatus.READY)
        logger.info("Track %s processed successfully (hnsw_label=%d)", external_track_id, hnsw_label)

        # 5. Callback в .NET
        await callback_fn(external_track_id, success=True, error_msg=None)

    except Exception as exc:
        error_msg = f"{type(exc).__name__}: {exc}"
        logger.exception("Failed to process track %s: %s", external_track_id, error_msg)
        db.set_status(external_track_id, ProcessingStatus.FAILED, error=error_msg)
        await callback_fn(external_track_id, success=False, error_msg=error_msg)
