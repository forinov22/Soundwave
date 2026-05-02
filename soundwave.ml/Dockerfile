# ── Stage 1: builder ─────────────────────────────────────────────────────────
# Устанавливаем зависимости в отдельном слое — кешируется при изменении кода
FROM python:3.11-slim AS builder

WORKDIR /build

# Системные зависимости для librosa / scipy / torch
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Копируем только манифест — чтобы зависимости кешировались отдельно от кода
COPY pyproject.toml .

# Ставим pip + wheel, потом зависимости проекта
# torch CPU-only колесо значительно легче GPU (~200 MB vs ~800 MB)
RUN pip install --upgrade pip wheel && \
    pip install --no-cache-dir \
        torch==2.3.0+cpu \
        torchaudio==2.3.0+cpu \
        --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir \
        fastapi uvicorn[standard] python-multipart \
        pydantic-settings \
        librosa scipy numpy \
        hnswlib \
        boto3 \
        httpx aiofiles tqdm

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Только runtime-зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Копируем установленные пакеты из builder
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=builder /usr/local/bin /usr/local/bin

# Копируем код приложения
COPY app/ ./app/
COPY cli/ ./cli/

# Создаём директории для данных и моделей (монтируются как volumes)
RUN mkdir -p /app/data /app/models

# Непривилегированный пользователь
RUN useradd -r -u 1001 -g root mluser && chown -R mluser:root /app
USER mluser

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
