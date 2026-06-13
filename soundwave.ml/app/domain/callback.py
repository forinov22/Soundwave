"""
Callback-клиент для уведомления .NET-сервиса о результатах обработки.

.NET ожидает: POST /api/internal/tracks/{track_id}/processed
Body: { "success": true, "error": null }
Header: X-Internal-Token: <shared_secret>
"""

from __future__ import annotations

import logging
import httpx
import warnings

warnings.filterwarnings("ignore", message=".*ssl.*", category=Warning)

from app.config import Settings

logger = logging.getLogger(__name__)


class DotNetCallback:
    def __init__(self, settings: Settings):
        self._base_url = settings.dotnet_base_url.rstrip("/")
        self._path_template = settings.dotnet_callback_path
        self._token = settings.internal_token
        self._client = httpx.AsyncClient(timeout=10.0, verify=False)

    async def notify(
        self,
        external_track_id: str,
        success: bool,
        error_msg: str | None,
    ) -> None:
        url = self._base_url + self._path_template.format(track_id=external_track_id)
        payload = {"success": success, "error": error_msg}
        headers = {"X-Internal-Token": self._token}

        try:
            resp = await self._client.post(url, json=payload, headers=headers)
            if resp.status_code not in (200, 204):
                logger.warning(
                    "Callback for track %s returned status %d: %s",
                    external_track_id, resp.status_code, resp.text[:200],
                )
            else:
                logger.info("Callback sent for track %s (success=%s)", external_track_id, success)
        except Exception as exc:
            # Callback не должен убивать обработку — логируем и идём дальше
            logger.error(
                "Failed to send callback for track %s: %s", external_track_id, exc
            )

    async def close(self):
        await self._client.aclose()
