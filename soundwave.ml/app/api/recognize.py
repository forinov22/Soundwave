"""
POST /recognize — распознавание трека по аудиофрагменту.

Принимает: multipart/form-data с полем "audio" (аудиофайл любого формата).
Возвращает: { confident, candidates: [...] } синхронно.

Время ответа: обычно < 1с (загрузка waveform + fingerprint + lookup в SQLite).
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel

from app.deps import get_audio_loader, get_db
from app.domain.audio.loader import AudioLoader
from app.domain.fingerprint.core import fingerprint_samples
from app.domain.fingerprint.matcher import MatchCandidate, is_confident, match_hashes
from app.domain.storage.db import MusicDB

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recognize"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CandidateOut(BaseModel):
    track_id: str             # external_track_id — Track.Id из .NET
    aligned_count: int
    total_matches: int
    alignment_fraction: float
    offset_seconds: float


class RecognizeResponse(BaseModel):
    confident: bool
    candidates: list[CandidateOut]


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post(
    "/recognize",
    response_model=RecognizeResponse,
    summary="Распознать трек по аудиофрагменту",
)
async def recognize(
    audio: UploadFile = File(..., description="Аудиофайл (mp3/wav/ogg/...)"),
    top_k: int = Query(default=5, ge=1, le=20),
    db: MusicDB = Depends(get_db),
    audio_loader: AudioLoader = Depends(get_audio_loader),
):
    # 1. Читаем байты из upload
    data = await audio.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty audio file")

    # 2. Декодируем waveform (librosa через BytesIO — любой формат)
    try:
        waveform = audio_loader.load_from_bytes(data)
    except Exception as exc:
        logger.warning("Failed to decode audio: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot decode audio: {exc}",
        )

    # 3. Fingerprint запроса
    query_hashes = fingerprint_samples(waveform)
    logger.info("Recognize: %d hashes in query", len(query_hashes))

    if not query_hashes:
        return RecognizeResponse(confident=False, candidates=[])

    # 4. Матчинг по БД
    results: list[MatchCandidate] = match_hashes(query_hashes, db, top_k=top_k)

    return RecognizeResponse(
        confident=is_confident(results),
        candidates=[
            CandidateOut(
                track_id=r.external_track_id,
                aligned_count=r.aligned_count,
                total_matches=r.total_matches,
                alignment_fraction=r.alignment_fraction,
                offset_seconds=r.offset_seconds,
            )
            for r in results
        ],
    )
