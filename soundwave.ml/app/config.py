"""
Конфигурация сервиса через переменные окружения.
Все значения можно задать через .env файл (в разработке) или
через переменные среды контейнера (в проде).
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Сервис ────────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8001
    log_level: str = "info"

    # Токен для авторизации между .NET и Python (X-Internal-Token заголовок).
    # Должен совпадать на обоих сервисах.
    internal_token: str = "change-me-in-production"

    # ── S3 ────────────────────────────────────────────────────────────────────
    s3_bucket: str = "soundwave"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_endpoint_url: str = "http://localhost:9000"   # MinIO / AWS
    s3_force_path_style: bool = True                  # True для MinIO

    # ── .NET callback ─────────────────────────────────────────────────────────
    # URL .NET-сервиса для callback'а после обработки трека.
    dotnet_base_url: str = "http://localhost:5000"
    dotnet_callback_path: str = "/api/internal/tracks/{track_id}/processed"

    # ── Пути к данным ─────────────────────────────────────────────────────────
    data_dir: Path = Path("data")
    models_dir: Path = Path("models")

    @property
    def db_path(self) -> str:
        return str(self.data_dir / "fingerprints.db")

    @property
    def hnsw_index_path(self) -> str:
        return str(self.data_dir / "embeddings.bin")

    @property
    def hnsw_labels_path(self) -> str:
        return str(self.data_dir / "embeddings_labels.json")

    @property
    def model_path(self) -> str:
        return str(self.models_dir / "best_model.pth")

    # ── Модель ────────────────────────────────────────────────────────────────
    embedding_size: int = 256
    n_mels: int = 128
    target_sr: int = 22050
    device: str = "cpu"   # "cuda" если есть GPU


@lru_cache
def get_settings() -> Settings:
    return Settings()
