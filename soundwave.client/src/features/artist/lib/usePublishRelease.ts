import { useState } from "react";
import axios from "axios";

import { artistApi } from "../api/artistApi";
import { useArtistStore } from "../model/artistStore";
import type { PublishConflictItem, PublishConflict } from "../types/Payloads";

// Публикация релиза с обработкой ошибок.
// Для конфликта 409 (треки уже опубликованы в другом релизе) — отдельное
// состояние, чтобы UI показал понятное объяснение со ссылками на конфликты.
export function usePublishRelease() {
  const upsertRelease = useArtistStore((s) => s.upsertRelease);
  const syncTrackReleaseRefs = useArtistStore((s) => s.syncTrackReleaseRefs);

  const [isPublishing, setIsPublishing] = useState(false);
  const [conflicts, setConflicts] = useState<PublishConflictItem[] | null>(
    null,
  );
  // Прочие ошибки публикации (валидация — нет треков, нет обложки, etc).
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  const publish = async (releaseId: number) => {
    setIsPublishing(true);
    setConflicts(null);
    setValidationMessage(null);
    try {
      const res = await artistApi.publishRelease(releaseId);
      upsertRelease(res.data);
      syncTrackReleaseRefs(res.data);
      return res.data;
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response) {
        const status = e.response.status;

        if (status === 409 && e.response.data) {
          const conflict = e.response.data as PublishConflict;
          if (conflict.details?.conflicts?.length) {
            setConflicts(conflict.details.conflicts);
            return null;
          }
        }

        if (status === 400 && e.response.data) {
          // ValidationException на бэке: { message }
          const data = e.response.data as { message?: string };
          setValidationMessage(data.message ?? "Не удалось опубликовать релиз");
          return null;
        }
      }
      throw e;
    } finally {
      setIsPublishing(false);
    }
  };

  const dismissConflicts = () => setConflicts(null);
  const dismissValidation = () => setValidationMessage(null);

  return {
    publish,
    isPublishing,
    conflicts,
    validationMessage,
    dismissConflicts,
    dismissValidation,
  };
}
