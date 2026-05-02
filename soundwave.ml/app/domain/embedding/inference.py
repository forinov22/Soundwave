"""
Инференс-движок для AudioEmbeddingModel.

Загружается один раз при старте сервиса (через lifespan FastAPI).
Метод embed() принимает waveform и возвращает numpy-вектор.

Пайплайн (из ноутбука, shazam_this_file):
  waveform → mono → resample (уже сделано в loader) → MelSpectrogram
  → AmplitudeToDB → per-sample normalization → model → L2-norm embedding
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import torch
import torchaudio.transforms as T

from app.domain.embedding.model import AudioEmbeddingModel


class EmbeddingEngine:
    def __init__(
        self,
        model_path: str,
        device: str = "cpu",
        n_mels: int = 128,
        embedding_size: int = 256,
        target_sr: int = 22050,
    ):
        self.device = torch.device(device)
        self.target_sr = target_sr
        self.n_mels = n_mels

        # Mel-трансформ создаём один раз — это дорогая операция при повторении
        self._mel_transform = T.MelSpectrogram(
            sample_rate=target_sr,
            n_fft=2048,
            hop_length=512,
            n_mels=n_mels,
        ).to(self.device)

        self._amp_to_db = T.AmplitudeToDB(top_db=80).to(self.device)

        # Загружаем модель
        self._model = AudioEmbeddingModel(n_mels=n_mels, embedding_size=embedding_size)
        self._load_weights(model_path)
        self._model.to(self.device)
        self._model.eval()

    def _load_weights(self, model_path: str):
        path = Path(model_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Файл модели не найден: {model_path}. "
                "Положи best_model.pth в папку models/"
            )
        checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
        # Поддерживаем оба варианта сохранения: чистый state_dict и checkpoint-словарь
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint
        self._model.load_state_dict(state_dict)

    @torch.no_grad()
    def embed(self, waveform: np.ndarray) -> np.ndarray:
        """
        waveform: float32 numpy array, моно, уже на target_sr.
        Возвращает L2-нормализованный вектор (embedding_size,).
        """
        # waveform → tensor [1, time]
        wav_t = torch.from_numpy(waveform).unsqueeze(0).to(self.device)

        # Спектрограмма [1, n_mels, time_frames]
        spec = self._amp_to_db(self._mel_transform(wav_t))

        # Per-sample нормализация (как в ноутбуке)
        spec = (spec - spec.mean()) / (spec.std() + 1e-8)

        # Маска — для полного трека всегда единицы [1, time_frames]
        mask = torch.ones(1, spec.shape[-1], device=self.device)

        # Прогон через модель
        emb = self._model(spec, mask)  # [1, embedding_size]
        return emb.cpu().numpy().squeeze(0)  # (embedding_size,)

    @property
    def embedding_size(self) -> int:
        return self._model.fc.out_features
