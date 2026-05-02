"""
SQLite-хранилище для питон-сервиса.

Намеренно НЕ дублируем метаданные треков (title, artist) —
они живут в .NET. Здесь только то, что нужно для ML-слоя:

  tracks(internal_id, external_track_id, status, error, hnsw_label)
    — external_track_id: Track.Id из .NET (строка, например "42")
    — status: pending | processing | ready | failed
    — hnsw_label: целочисленный ярлык в hnswlib-индексе (NULL пока не проиндексирован)

  fingerprints(hash, track_id, offset)
    — track_id: внутренний id из tracks.internal_id
    — hash, offset: как в оригинальном fingerprint.py

Индекс на fingerprints.hash — ключ к быстрому поиску.
"""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from enum import Enum
from typing import Optional


SCHEMA = """
CREATE TABLE IF NOT EXISTS tracks (
    internal_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    external_track_id TEXT UNIQUE NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending',
    error            TEXT,
    hnsw_label       INTEGER
);

CREATE TABLE IF NOT EXISTS fingerprints (
    hash     INTEGER NOT NULL,
    track_id INTEGER NOT NULL,
    offset   INTEGER NOT NULL,
    FOREIGN KEY (track_id) REFERENCES tracks(internal_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fp_hash ON fingerprints(hash);
CREATE INDEX IF NOT EXISTS idx_track_ext ON tracks(external_track_id);
CREATE INDEX IF NOT EXISTS idx_hnsw_label ON tracks(hnsw_label);
"""


class ProcessingStatus(str, Enum):
    PENDING    = "pending"
    PROCESSING = "processing"
    READY      = "ready"
    FAILED     = "failed"


@dataclass
class TrackRecord:
    internal_id: int
    external_track_id: str
    status: ProcessingStatus
    error: Optional[str]
    hnsw_label: Optional[int]


class MusicDB:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_schema()

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA foreign_keys=ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_schema(self):
        with self._connect() as conn:
            conn.executescript(SCHEMA)

    # ── Треки ─────────────────────────────────────────────────────────────────

    def get_or_create_track(self, external_track_id: str) -> TrackRecord:
        """Возвращает существующий трек или создаёт новый со статусом pending."""
        with self._connect() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO tracks(external_track_id, status) VALUES (?, ?)",
                (external_track_id, ProcessingStatus.PENDING),
            )
            row = conn.execute(
                "SELECT internal_id, external_track_id, status, error, hnsw_label "
                "FROM tracks WHERE external_track_id = ?",
                (external_track_id,),
            ).fetchone()
        return self._row_to_record(row)

    def get_track(self, external_track_id: str) -> Optional[TrackRecord]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT internal_id, external_track_id, status, error, hnsw_label "
                "FROM tracks WHERE external_track_id = ?",
                (external_track_id,),
            ).fetchone()
        return self._row_to_record(row) if row else None

    def get_track_by_internal(self, internal_id: int) -> Optional[TrackRecord]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT internal_id, external_track_id, status, error, hnsw_label "
                "FROM tracks WHERE internal_id = ?",
                (internal_id,),
            ).fetchone()
        return self._row_to_record(row) if row else None

    def get_track_by_hnsw_label(self, hnsw_label: int) -> Optional[TrackRecord]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT internal_id, external_track_id, status, error, hnsw_label "
                "FROM tracks WHERE hnsw_label = ?",
                (hnsw_label,),
            ).fetchone()
        return self._row_to_record(row) if row else None

    def set_status(
        self,
        external_track_id: str,
        status: ProcessingStatus,
        error: Optional[str] = None,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE tracks SET status = ?, error = ? WHERE external_track_id = ?",
                (status, error, external_track_id),
            )

    def set_hnsw_label(self, external_track_id: str, label: int) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE tracks SET hnsw_label = ? WHERE external_track_id = ?",
                (label, external_track_id),
            )

    def delete_track(self, external_track_id: str) -> bool:
        """Удаляет трек и всё связанное (fingerprints каскадом). Возвращает True если было что удалять."""
        with self._connect() as conn:
            cur = conn.execute(
                "DELETE FROM tracks WHERE external_track_id = ?",
                (external_track_id,),
            )
        return cur.rowcount > 0

    def count_tracks(self) -> int:
        with self._connect() as conn:
            return int(conn.execute("SELECT COUNT(*) FROM tracks").fetchone()[0])

    # ── Фингерпринты ──────────────────────────────────────────────────────────

    def add_fingerprints(self, internal_id: int, hashes: list[tuple[int, int]]) -> int:
        """Массовая вставка. hashes — список (hash, offset)."""
        if not hashes:
            return 0
        with self._connect() as conn:
            # Сначала чистим старые (на случай re-index)
            conn.execute("DELETE FROM fingerprints WHERE track_id = ?", (internal_id,))
            conn.executemany(
                "INSERT INTO fingerprints(hash, track_id, offset) VALUES (?,?,?)",
                [(h, internal_id, off) for h, off in hashes],
            )
        return len(hashes)

    def lookup_hashes(self, hashes: list[int]) -> list[tuple[int, int, int]]:
        """По списку хэшей запроса → (query_hash, internal_track_id, offset)."""
        if not hashes:
            return []
        unique = list(set(hashes))
        results = []
        CHUNK = 900
        with self._connect() as conn:
            for i in range(0, len(unique), CHUNK):
                chunk = unique[i:i + CHUNK]
                ph = ",".join("?" * len(chunk))
                rows = conn.execute(
                    f"SELECT hash, track_id, offset FROM fingerprints WHERE hash IN ({ph})",
                    chunk,
                ).fetchall()
                results.extend(rows)
        return [(int(h), int(tid), int(off)) for h, tid, off in results]

    def count_fingerprints(self) -> int:
        with self._connect() as conn:
            return int(conn.execute("SELECT COUNT(*) FROM fingerprints").fetchone()[0])

    # ── Вспомогательное ───────────────────────────────────────────────────────

    @staticmethod
    def _row_to_record(row: tuple) -> TrackRecord:
        return TrackRecord(
            internal_id=int(row[0]),
            external_track_id=str(row[1]),
            status=ProcessingStatus(row[2]),
            error=row[3],
            hnsw_label=int(row[4]) if row[4] is not None else None,
        )
