"""
Архитектура модели — копия из ноутбука, без изменений.
Менять только если изменилась архитектура при переобучении.
"""

from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F


class AudioEmbeddingModel(nn.Module):
    def __init__(self, n_mels: int = 128, embedding_size: int = 256):
        super().__init__()

        self.conv_block = nn.Sequential(
            self._make_layer(n_mels, 128),
            self._make_layer(128, 256),
            self._make_layer(256, 512),
            self._make_layer(512, 512),
        )

        self.fc = nn.Linear(512, embedding_size)

    @staticmethod
    def _make_layer(in_ch: int, out_ch: int) -> nn.Sequential:
        return nn.Sequential(
            nn.Conv1d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm1d(out_ch),
            nn.ReLU(),
            nn.MaxPool1d(2),
        )

    def masked_avg_pool(self, x: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        """
        x:    [batch, channels, time_reduced]
        mask: [batch, time_original]
        """
        curr_time_size = x.shape[-1]
        reduced_mask = F.interpolate(
            mask.unsqueeze(1), size=curr_time_size, mode="nearest"
        )
        x = x * reduced_mask
        sum_x = x.sum(dim=-1)
        count = reduced_mask.sum(dim=-1).clamp(min=1e-8)
        return sum_x / count

    def forward(self, x: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        """
        x:    [batch, n_mels, time]
        mask: [batch, time]   — единицы где данные, нули где паддинг
        """
        features = self.conv_block(x)
        pooled = self.masked_avg_pool(features, mask)
        embedding = self.fc(pooled)
        return F.normalize(embedding, p=2, dim=1)
