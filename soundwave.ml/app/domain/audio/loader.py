"""
Загрузка аудио из S3 во временный файл, конвертация в numpy waveform.
"""

from __future__ import annotations

import io
import tempfile
from pathlib import Path

import boto3
import numpy as np
from botocore.config import Config

from app.config import Settings


class AudioLoader:
    def __init__(self, settings: Settings):
        self._bucket = settings.s3_bucket
        self._target_sr = settings.target_sr
        self._s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            endpoint_url=settings.s3_endpoint_url,
            config=Config(signature_version="s3v4"),
        )

    def load_from_s3(self, s3_key: str) -> np.ndarray:
        """
        Скачивает файл из S3 по ключу, возвращает waveform (float32, моно, target_sr).

        Используем in-memory buffer → librosa.load, без временных файлов на диске.
        librosa умеет читать из BytesIO через soundfile.
        """
        import librosa

        buf = io.BytesIO()
        self._s3.download_fileobj(self._bucket, s3_key, buf)
        buf.seek(0)

        y, _ = librosa.load(buf, sr=self._target_sr, mono=True)
        return y.astype(np.float32)

    def load_from_bytes(self, data: bytes) -> np.ndarray:
        """Загружает waveform из байтового буфера (для /recognize endpoint)."""
        import librosa

        buf = io.BytesIO(data)
        y, _ = librosa.load(buf, sr=self._target_sr, mono=True)
        return y.astype(np.float32)
