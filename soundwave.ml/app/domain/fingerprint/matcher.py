"""
Алгоритм распознавания — адаптирован из recognize.py.
match_hashes теперь принимает MusicDB вместо FingerprintDB.
Возвращает внешние track_id (.NET) вместо внутренних.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass

from app.domain.fingerprint.core import HOP_SIZE, SAMPLE_RATE
from app.domain.storage.db import MusicDB

# ── Критерии уверенности ─────────────────────────────────────────────────────

MIN_ALIGNED_MATCHES = 5
MIN_SCORE_RATIO = 2.0
MIN_ALIGNMENT_FRACTION = 0.05


@dataclass
class MatchCandidate:
    external_track_id: str   # Track.Id из .NET
    aligned_count: int
    total_matches: int
    offset_seconds: float

    @property
    def alignment_fraction(self) -> float:
        return self.aligned_count / self.total_matches if self.total_matches else 0.0


def match_hashes(
    query_hashes: list[tuple[int, int]],
    db: MusicDB,
    top_k: int = 5,
) -> list[MatchCandidate]:
    """
    query_hashes: [(hash, query_offset), ...]
    Возвращает топ-K кандидатов по числу выровненных совпадений.
    """
    if not query_hashes:
        return []

    query_offsets: dict[int, list[int]] = defaultdict(list)
    for h, off in query_hashes:
        query_offsets[h].append(off)

    db_hits = db.lookup_hashes(list(query_offsets.keys()))
    if not db_hits:
        return []

    # Гистограмма сдвигов для каждого трека
    per_track_delta: dict[int, Counter] = defaultdict(Counter)
    per_track_total: Counter = Counter()

    for h, internal_track_id, db_offset in db_hits:
        for q_offset in query_offsets[h]:
            delta = db_offset - q_offset
            per_track_delta[internal_track_id][delta] += 1
            per_track_total[internal_track_id] += 1

    # Пик гистограммы для каждого трека
    candidates = []
    for internal_id, deltas in per_track_delta.items():
        best_delta, best_count = deltas.most_common(1)[0]
        candidates.append((internal_id, best_delta, best_count, per_track_total[internal_id]))

    candidates.sort(key=lambda x: x[2], reverse=True)

    results = []
    for internal_id, best_delta, aligned, total in candidates[:top_k]:
        track = db.get_track_by_internal(internal_id)
        if track is None:
            continue
        results.append(MatchCandidate(
            external_track_id=track.external_track_id,
            aligned_count=aligned,
            total_matches=total,
            offset_seconds=best_delta * HOP_SIZE / SAMPLE_RATE,
        ))
    return results


def is_confident(results: list[MatchCandidate]) -> bool:
    if not results:
        return False
    best = results[0]
    if best.aligned_count < MIN_ALIGNED_MATCHES:
        return False
    if best.alignment_fraction < MIN_ALIGNMENT_FRACTION:
        return False
    if len(results) > 1:
        second = results[1]
        if second.aligned_count > 0 and best.aligned_count / second.aligned_count < MIN_SCORE_RATIO:
            return False
    return True
