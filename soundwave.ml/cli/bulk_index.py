"""
Bulk-индексация существующих треков.

Используется при первом запуске (если треки уже есть в S3/на диске)
или при переиндексации после изменения алгоритма.

Режимы:
  --source s3     : читает из S3, ожидает CSV с колонками track_id,s3_key
  --source local  : читает аудиофайлы из локальной папки
                    ожидает формат имён: "<id> - <artists> - <title>.mp3"

Использование:
  # Из локальной папки
  python -m cli.bulk_index --source local --dir /path/to/music --workers 4

  # Из S3 по CSV
  python -m cli.bulk_index --source s3 --csv tracks.csv --workers 2
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

# Добавляем корень проекта в PYTHONPATH при запуске как скрипта
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.domain.audio.loader import AudioLoader
from app.domain.embedding.inference import EmbeddingEngine
from app.domain.fingerprint.core import fingerprint_samples
from app.domain.storage.db import MusicDB, ProcessingStatus
from app.domain.storage.vector_store import VectorStore

AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".ogg", ".opus"}
FILENAME_RE = re.compile(r"^\s*(?P<id>\d+)\s*-\s*(?P<artists>.+?)\s*-\s*(?P<title>.+?)\s*$")


def _fingerprint_file(path: str) -> tuple[str, list[tuple[int, int]] | None, str | None]:
    """Воркер для параллельной fingerprint-обработки (CPU-bound)."""
    import librosa
    try:
        y, _ = librosa.load(path, sr=22050, mono=True)
        hashes = fingerprint_samples(y)
        return path, hashes, None
    except Exception as e:
        return path, None, f"{type(e).__name__}: {e}"


def index_local_dir(root: Path, db: MusicDB, vector_store: VectorStore, embedding_engine: EmbeddingEngine,
                    workers: int, skip_existing: bool = True):
    import librosa

    files = sorted([f for f in root.rglob("*") if f.is_file() and f.suffix.lower() in AUDIO_EXTENSIONS])
    print(f"Найдено аудиофайлов: {len(files)}")

    to_process = []
    for f in files:
        m = FILENAME_RE.match(f.stem)
        if m is None:
            print(f"  Пропуск (имя не по формату): {f.name}")
            continue
        track_id = m.group("id")
        if skip_existing:
            rec = db.get_track(track_id)
            if rec and rec.status == ProcessingStatus.READY:
                continue
        to_process.append((str(f), track_id))

    print(f"К обработке: {len(to_process)}")
    if not to_process:
        return

    t0 = time.time()
    path_to_id = {p: tid for p, tid in to_process}

    with ProcessPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(_fingerprint_file, p): p for p, _ in to_process}
        for i, fut in enumerate(as_completed(futures), 1):
            path, hashes, err = fut.result()
            track_id = path_to_id[path]

            if err:
                print(f"  [{i}/{len(to_process)}] ОШИБКА {Path(path).name}: {err}")
                db.get_or_create_track(track_id)
                db.set_status(track_id, ProcessingStatus.FAILED, err)
                continue

            rec = db.get_or_create_track(track_id)
            db.add_fingerprints(rec.internal_id, hashes)

            # Embedding (не параллелим — модель не thread-safe без GIL)
            import numpy as np
            y, _ = librosa.load(path, sr=22050, mono=True)
            emb = embedding_engine.embed(y)
            label = vector_store.add(track_id, emb)
            db.set_hnsw_label(track_id, label)
            db.set_status(track_id, ProcessingStatus.READY)

            elapsed = time.time() - t0
            print(f"  [{i}/{len(to_process)}] {Path(path).name}: {len(hashes)} хэшей")

    print(f"\nГотово за {time.time() - t0:.1f}с")
    print(f"Треков в базе: {db.count_tracks()}")


def index_from_csv(csv_path: str, db: MusicDB, vector_store: VectorStore,
                   embedding_engine: EmbeddingEngine, audio_loader: AudioLoader,
                   skip_existing: bool = True):
    """Читает CSV track_id,s3_key и индексирует треки из S3."""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Строк в CSV: {len(rows)}")
    t0 = time.time()

    for i, row in enumerate(rows, 1):
        track_id = row["track_id"]
        s3_key = row["s3_key"]

        if skip_existing:
            rec = db.get_track(track_id)
            if rec and rec.status == ProcessingStatus.READY:
                print(f"  [{i}/{len(rows)}] skip {track_id}")
                continue

        try:
            waveform = audio_loader.load_from_s3(s3_key)
            hashes = fingerprint_samples(waveform)
            emb = embedding_engine.embed(waveform)

            rec = db.get_or_create_track(track_id)
            db.add_fingerprints(rec.internal_id, hashes)
            label = vector_store.add(track_id, emb)
            db.set_hnsw_label(track_id, label)
            db.set_status(track_id, ProcessingStatus.READY)

            print(f"  [{i}/{len(rows)}] {track_id}: {len(hashes)} хэшей  (s3: {s3_key})")
        except Exception as e:
            print(f"  [{i}/{len(rows)}] ОШИБКА {track_id}: {e}")
            db.get_or_create_track(track_id)
            db.set_status(track_id, ProcessingStatus.FAILED, str(e))

    print(f"\nГотово за {time.time() - t0:.1f}с")


def main():
    settings = get_settings()
    Path(settings.data_dir).mkdir(parents=True, exist_ok=True)

    db = MusicDB(settings.db_path)
    vector_store = VectorStore(settings.hnsw_index_path, settings.hnsw_labels_path, settings.embedding_size)
    embedding_engine = EmbeddingEngine(settings.model_path, settings.device, settings.n_mels,
                                       settings.embedding_size, settings.target_sr)

    parser = argparse.ArgumentParser(description="Bulk-индексация треков")
    parser.add_argument("--source", choices=["local", "s3"], required=True)
    parser.add_argument("--dir", help="Папка с аудиофайлами (для --source local)")
    parser.add_argument("--csv", help="CSV-файл track_id,s3_key (для --source s3)")
    parser.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    parser.add_argument("--reindex", action="store_true")
    args = parser.parse_args()

    if args.source == "local":
        if not args.dir:
            parser.error("--dir обязателен для --source local")
        root = Path(args.dir).expanduser().resolve()
        if not root.is_dir():
            print(f"Нет такой папки: {root}", file=sys.stderr)
            sys.exit(1)
        index_local_dir(root, db, vector_store, embedding_engine, args.workers, not args.reindex)
    else:
        if not args.csv:
            parser.error("--csv обязателен для --source s3")
        audio_loader = AudioLoader(settings)
        index_from_csv(args.csv, db, vector_store, embedding_engine, audio_loader, not args.reindex)


if __name__ == "__main__":
    main()
