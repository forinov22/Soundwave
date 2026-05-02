"""
Ядро фингерпринтинга — перенесено из fingerprint.py практически без изменений.
Единственная правка: убрали load_audio/fingerprint_file (теперь waveform
приходит уже загруженным через AudioLoader).
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Iterator

import numpy as np
from scipy.ndimage import generate_binary_structure, iterate_structure, maximum_filter

# ── Параметры ─────────────────────────────────────────────────────────────────

SAMPLE_RATE = 22050
FFT_WINDOW_SIZE = 4096
HOP_SIZE = 1024

PEAK_NEIGHBORHOOD_SIZE = 20
MIN_AMPLITUDE = 10.0

FAN_VALUE = 15
MIN_TIME_DELTA = 0
MAX_TIME_DELTA = 200


@dataclass
class Peak:
    time: int
    freq: int


def compute_spectrogram(samples: np.ndarray, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    import scipy.signal as sig

    _, _, Zxx = sig.stft(
        samples,
        fs=sample_rate,
        window="hann",
        nperseg=FFT_WINDOW_SIZE,
        noverlap=FFT_WINDOW_SIZE - HOP_SIZE,
        boundary=None,
        padded=False,
    )
    return (20.0 * np.log10(np.abs(Zxx) + 1e-10)).astype(np.float32)


def find_peaks(spectrogram: np.ndarray) -> list[Peak]:
    struct = generate_binary_structure(2, 2)
    neighborhood = iterate_structure(struct, PEAK_NEIGHBORHOOD_SIZE)

    local_max = maximum_filter(spectrogram, footprint=neighborhood) == spectrogram
    threshold = np.median(spectrogram) + MIN_AMPLITUDE
    above_threshold = spectrogram > threshold

    freq_idx, time_idx = np.where(local_max & above_threshold)
    return [Peak(time=int(t), freq=int(f)) for t, f in zip(time_idx, freq_idx)]


def _hash_pair(f1: int, f2: int, dt: int) -> int:
    s = f"{f1}|{f2}|{dt}".encode("utf-8")
    return int.from_bytes(hashlib.sha1(s).digest()[:4], "big")


def generate_hashes(peaks: list[Peak]) -> Iterator[tuple[int, int]]:
    peaks_sorted = sorted(peaks, key=lambda p: (p.time, p.freq))
    n = len(peaks_sorted)

    for i in range(n):
        anchor = peaks_sorted[i]
        taken = 0
        for j in range(i + 1, n):
            if taken >= FAN_VALUE:
                break
            target = peaks_sorted[j]
            dt = target.time - anchor.time
            if dt < MIN_TIME_DELTA:
                continue
            if dt > MAX_TIME_DELTA:
                break
            yield _hash_pair(anchor.freq, target.freq, dt), anchor.time
            taken += 1


def fingerprint_samples(samples: np.ndarray, sample_rate: int = SAMPLE_RATE) -> list[tuple[int, int]]:
    """Полный пайплайн: waveform → [(hash, offset), ...]."""
    if samples.ndim > 1:
        samples = samples.mean(axis=1)
    samples = samples.astype(np.float32)

    spec = compute_spectrogram(samples, sample_rate)
    peaks = find_peaks(spec)
    return list(generate_hashes(peaks))
