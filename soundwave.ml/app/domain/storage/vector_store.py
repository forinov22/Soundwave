"""
Обёртка над hnswlib для хранения и поиска эмбеддингов.

Особенности:
  - Индекс живёт в памяти и персистируется в файл при каждом add/delete.
  - Маппинг hnswlib-label → external_track_id хранится рядом (JSON).
  - Thread-safe через threading.Lock (FastAPI воркеры шарят один процесс).
  - При старте автоматически загружается с диска если файл существует.

hnswlib-label — это просто int (0, 1, 2, ...).
Мы выдаём новый label как max_existing + 1.
При "удалении" трека мы помечаем label как удалённый в маппинге
(hnswlib не поддерживает физическое удаление без перестройки индекса).
"""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Optional

import numpy as np


class VectorStore:
    def __init__(self, index_path: str, labels_path: str, embedding_size: int = 256):
        self.index_path = Path(index_path)
        self.labels_path = Path(labels_path)
        self.embedding_size = embedding_size
        self._lock = threading.Lock()

        # label (int) → external_track_id (str), None если удалён
        self._label_to_ext: dict[int, Optional[str]] = {}

        self._index = self._create_index()
        self._load()

    def _create_index(self):
        import hnswlib
        index = hnswlib.Index(space="cosine", dim=self.embedding_size)
        return index

    def _load(self):
        """Загружает индекс и маппинг с диска при старте."""
        if self.index_path.exists() and self.labels_path.exists():
            self._index.load_index(str(self.index_path), max_elements=100_000)
            with open(self.labels_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
            # JSON keys — строки, конвертируем обратно в int
            self._label_to_ext = {int(k): v for k, v in raw.items()}
        else:
            # Инициализируем пустой индекс
            self._index.init_index(max_elements=10_000, ef_construction=200, M=16)
            self._index.set_ef(50)

    def _save(self):
        """Сохраняет на диск. Вызывается после каждой мутации."""
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self._index.save_index(str(self.index_path))
        with open(self.labels_path, "w", encoding="utf-8") as f:
            json.dump(self._label_to_ext, f)

    def _next_label(self) -> int:
        if not self._label_to_ext:
            return 0
        return max(self._label_to_ext.keys()) + 1

    def add(self, external_track_id: str, embedding: np.ndarray) -> int:
        """Добавляет вектор. Возвращает назначенный label."""
        with self._lock:
            # Если трек уже есть — обновляем (удаляем логически, добавляем заново)
            existing_label = self._ext_to_label(external_track_id)
            if existing_label is not None:
                self._label_to_ext[existing_label] = None  # помечаем как удалённый

            label = self._next_label()

            # hnswlib требует numpy float32 с правильным shape
            vec = embedding.astype(np.float32).reshape(1, -1)

            # Если индекс переполняется — расширяем
            current_max = self._index.get_max_elements()
            if label >= current_max - 1:
                self._index.resize_index(current_max + 5_000)

            self._index.add_items(vec, [label])
            self._label_to_ext[label] = external_track_id
            self._save()
        return label

    def remove(self, external_track_id: str) -> bool:
        """Логическое удаление. hnswlib не поддерживает физическое без перестройки."""
        with self._lock:
            label = self._ext_to_label(external_track_id)
            if label is None:
                return False
            self._label_to_ext[label] = None
            self._save()
        return True

    def search(self, embedding: np.ndarray, k: int = 20) -> list[tuple[str, float]]:
        """
        Поиск K ближайших. Возвращает [(external_track_id, distance), ...].
        distance = косинусное расстояние [0, 2], меньше = лучше.
        Логически удалённые треки фильтруются из результатов.
        """
        with self._lock:
            # Считаем живых элементов (не None)
            n_alive = sum(1 for v in self._label_to_ext.values() if v is not None)
            if n_alive == 0:
                return []

            # Запрашиваем больше, чем k — чтобы хватило после фильтрации удалённых
            k_query = min(k * 3, n_alive)
            vec = embedding.astype(np.float32).reshape(1, -1)
            labels, distances = self._index.knn_query(vec, k=k_query)

            results = []
            for label, dist in zip(labels[0], distances[0]):
                ext_id = self._label_to_ext.get(int(label))
                if ext_id is None:
                    continue  # логически удалён
                results.append((ext_id, float(dist)))
                if len(results) >= k:
                    break

        return results

    def get_embedding(self, external_track_id: str) -> Optional[np.ndarray]:
        """Возвращает вектор эмбеддинга для трека или None если не найден."""
        with self._lock:
            label = self._ext_to_label(external_track_id)
            if label is None:
                return None
            # hnswlib позволяет получить вектор по label через get_items
            vecs = self._index.get_items([label])
            return np.array(vecs[0], dtype=np.float32)

    def count(self) -> int:
        with self._lock:
            return sum(1 for v in self._label_to_ext.values() if v is not None)

    def _ext_to_label(self, external_track_id: str) -> Optional[int]:
        """Ищем label по external_track_id. O(N), но N обычно мал."""
        for label, ext_id in self._label_to_ext.items():
            if ext_id == external_track_id:
                return label
        return None
