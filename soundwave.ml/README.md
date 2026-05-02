# Soundwave ML Service

FastAPI-сервис для fingerprint-распознавания треков и ML-рекомендаций.

## Что делает

- `POST /tracks/{id}/process` — получает задачу обработки трека от .NET, запускает в фоне: скачивает из S3, строит fingerprint + embedding, по завершении шлёт callback в .NET.
- `POST /recognize` — принимает аудиофрагмент, возвращает список кандидатов с уверенностью.
- `GET /tracks/{id}/similar?k=20` — топ-K похожих треков по ML-эмбеддингу.
- `GET /tracks/{id}/wave?length=50` — «волна» треков (цепочка похожих).
- `GET /health` — статус + счётчики.

## Быстрый старт

### 1. Добавить модель

```bash
mkdir -p models
cp /path/to/best_model.pth models/
```

### 2. Настроить окружение

```bash
cp .env.example .env
# Отредактируй .env: S3-ключи, INTERNAL_TOKEN, DOTNET_BASE_URL
```

### 3. Запустить через Docker Compose

```bash
docker compose up --build
```

Сервис поднимется на `http://localhost:8001`. MinIO Console — на `http://localhost:9001`.

### Первый запуск без Docker (разработка)

```bash
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8001
```

## Bulk-индексация существующих треков

Если треки уже есть на диске:
```bash
python -m cli.bulk_index --source local --dir /path/to/music --workers 4
```

Если треки в S3 (CSV с колонками `track_id,s3_key`):
```bash
python -m cli.bulk_index --source s3 --csv tracks.csv
```

## API

### POST /tracks/{track_id}/process
Авторизация: `X-Internal-Token`

```json
{ "s3_key": "audio/12345.mp3" }
```

Ответ `202 Accepted`:
```json
{ "track_id": "42", "status": "processing" }
```

После обработки сервис шлёт POST в .NET:
`POST /api/internal/tracks/42/processed`
```json
{ "success": true, "error": null }
```

### POST /recognize
```
Content-Type: multipart/form-data
audio: <file>
?top_k=5
```

Ответ:
```json
{
  "confident": true,
  "candidates": [
    {
      "track_id": "42",
      "aligned_count": 47,
      "total_matches": 112,
      "alignment_fraction": 0.42,
      "offset_seconds": 14.5
    }
  ]
}
```

### GET /tracks/{id}/similar?k=20
```json
{
  "source_track_id": "42",
  "items": [
    { "track_id": "17", "distance": 0.12 },
    { "track_id": "88", "distance": 0.19 }
  ]
}
```

### GET /tracks/{id}/wave?length=30
```json
{
  "source_track_id": "42",
  "wave": ["42", "17", "55", "88", ...]
}
```

## Архитектура

```
.NET (Soundwave.Api)
  │
  │ POST /tracks/{id}/process (X-Internal-Token)
  ▼
soundwave-ml (FastAPI)
  │
  ├── domain/
  │   ├── fingerprint/core.py   — Shazam-алгоритм (STFT → пики → хэши)
  │   ├── fingerprint/matcher.py — гистограммный матчинг
  │   ├── embedding/model.py    — AudioEmbeddingModel (Conv1D, 256-dim)
  │   ├── embedding/inference.py — waveform → embedding
  │   ├── audio/loader.py       — S3 / bytes → waveform
  │   ├── storage/db.py         — SQLite (fingerprints + track status)
  │   ├── storage/vector_store.py — hnswlib (ANN-поиск по эмбеддингам)
  │   └── worker.py             — фоновая обработка трека
  │
  └── POST /api/internal/tracks/{id}/processed  → .NET callback
```

## Изменения в .NET

См. `DOTNET_CHANGES.cs`:
1. `Track` entity: поля `ProcessingStatus`, `ProcessingError`.
2. `MlServiceClient`: HTTP-клиент к Python.
3. `InternalController`: endpoint для callback'а.
4. `ArtistService.CreateTrackAsync`: запуск обработки после загрузки в S3.
5. `ArtistService.DeleteTrackAsync`: удаление из ML-сервиса.
6. `ReleaseService.PublishAsync`: проверка что все треки `Ready`.
