"""
GET /tracks/{track_id}/similar?k=20   — топ-K похожих треков по эмбеддингу
GET /tracks/{track_id}/wave?length=50 — "волна" треков: цепочка похожих от данного

Оба возвращают только external_track_id — .NET сам достаёт метаданные.

Что такое "волна":
  Начиная с трека T0, находим похожий T1 → от T1 ищем T2, не совпадающий с T0, и т.д.
  Результат — последовательность треков, каждый следующий близок к предыдущему,
  но не повторяется. Это грубая аппроксимация радио/DJ-микса.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.deps import get_db, get_embedding_engine, get_vector_store
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.storage.db import MusicDB, ProcessingStatus
from app.domain.storage.vector_store import VectorStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tracks", tags=["similar"])


class SimilarItem(BaseModel):
    track_id: str
    distance: float   # косинусное расстояние [0, 2], меньше = лучше


class SimilarResponse(BaseModel):
    source_track_id: str
    items: list[SimilarItem]


class WaveResponse(BaseModel):
    source_track_id: str
    wave: list[str]   # список external_track_id в порядке "похожести по цепочке"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_embedding_for_track(
    track_id: str,
    db: MusicDB,
    vector_store: VectorStore,
    embedding_engine: EmbeddingEngine,
) -> tuple[str, "np.ndarray"]:
    """Возвращает (track_id, embedding) или кидает HTTPException."""
    import numpy as np

    track = db.get_track(track_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    if track.status != ProcessingStatus.READY:
        raise HTTPException(
            status_code=409,
            detail=f"Track is not ready yet (status={track.status})",
        )
    if track.hnsw_label is None:
        raise HTTPException(status_code=409, detail="Track has no embedding")

    # Восстанавливаем вектор из hnswlib по label
    # hnswlib не даёт прямого доступа к вектору по label без поиска,
    # поэтому делаем поиск с k=1 по самому себе через vector_store.search.
    # Нужен сам вектор — получаем через отдельный запрос к индексу.
    # Для этого нам нужна ссылка на _index — сделаем через публичный метод.
    emb = vector_store.get_embedding(track_id)
    if emb is None:
        raise HTTPException(status_code=409, detail="Embedding not found in index")

    return track_id, emb


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "/{track_id}/similar",
    response_model=SimilarResponse,
    summary="Найти похожие треки по эмбеддингу",
)
def similar(
    track_id: str,
    k: int = Query(default=20, ge=1, le=100),
    db: MusicDB = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
    embedding_engine: EmbeddingEngine = Depends(get_embedding_engine),
):
    _, emb = _get_embedding_for_track(track_id, db, vector_store, embedding_engine)

    # k+1 потому что первый результат обычно сам трек (расстояние ≈ 0)
    raw = vector_store.search(emb, k=k + 1)

    items = [
        SimilarItem(track_id=ext_id, distance=dist)
        for ext_id, dist in raw
        if ext_id != track_id   # исключаем сам трек из результатов
    ][:k]

    return SimilarResponse(source_track_id=track_id, items=items)


@router.get(
    "/{track_id}/wave",
    response_model=WaveResponse,
    summary="Построить 'волну' — цепочку похожих треков",
)
def wave(
    track_id: str,
    length: int = Query(default=20, ge=2, le=100),
    db: MusicDB = Depends(get_db),
    vector_store: VectorStore = Depends(get_vector_store),
    embedding_engine: EmbeddingEngine = Depends(get_embedding_engine),
):
    """
    Алгоритм:
      1. Начинаем с трека T0.
      2. Находим топ-10 похожих на T0 → берём первый не-использованный → T1.
      3. Находим топ-10 похожих на T1 → T2 (не использованный ранее).
      4. И так далее до length.

    Жадный алгоритм, не оптимальный, но быстрый и интуитивный.
    """
    _, start_emb = _get_embedding_for_track(track_id, db, vector_store, embedding_engine)

    wave_ids: list[str] = [track_id]
    visited: set[str] = {track_id}
    current_emb = start_emb

    for _ in range(length - 1):
        # Берём немного больше кандидатов чтобы исключить уже посещённые
        candidates = vector_store.search(current_emb, k=min(len(visited) + 10, 50))

        next_id = None
        next_emb = None
        for ext_id, _ in candidates:
            if ext_id not in visited:
                next_id = ext_id
                next_emb = vector_store.get_embedding(ext_id)
                break

        if next_id is None or next_emb is None:
            break   # база кончилась

        wave_ids.append(next_id)
        visited.add(next_id)
        current_emb = next_emb

    return WaveResponse(source_track_id=track_id, wave=wave_ids)
