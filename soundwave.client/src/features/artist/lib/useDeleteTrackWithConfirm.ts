import { useState } from "react";
import axios from "axios";

import { artistApi } from "../api/artistApi";
import { useArtistStore } from "../model/artistStore";
import type { DeleteTrackConflict, DraftReleaseRef } from "../types/Payloads";

// Состояние диалога подтверждения. Закрытое — null.
// Открытое — содержит инфу о конфликте, чтобы UI мог показать список драфтов.
export interface DeleteConfirmState {
  trackId: number;
  trackTitle: string;
  draftReleases: DraftReleaseRef[];
}

// Двухшаговое удаление трека.
//
// Шаг 1 (deleteTrack): пробуем удалить без force.
//   - 204 → удалили, обновляем стор. (Трек был свободен.)
//   - 409 с draftReleases → открываем диалог подтверждения.
//   - 409 с publishedReleases → ошибка, удалить нельзя в принципе.
//   - другая ошибка → пробрасываем.
//
// Шаг 2 (confirmForceDelete): пользователь подтвердил —
// повторяем запрос с force=true.
export function useDeleteTrackWithConfirm() {
  const removeTrack = useArtistStore((s) => s.removeTrack);

  const [confirmState, setConfirmState] = useState<DeleteConfirmState | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  // Сообщение о том, что удалить нельзя совсем (трек в опубликованных).
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const deleteTrack = async (trackId: number, trackTitle: string) => {
    setIsDeleting(true);
    setBlockedMessage(null);
    try {
      await artistApi.deleteTrack(trackId, false);
      removeTrack(trackId);
    } catch (e: unknown) {
      // 409 — нужно разобрать тело
      if (
        axios.isAxiosError(e) &&
        e.response?.status === 409 &&
        e.response.data
      ) {
        const conflict = e.response.data as DeleteTrackConflict;

        if (conflict.details?.publishedReleases?.length) {
          // Заблокировано — трек в опубликованных релизах.
          setBlockedMessage(conflict.message);
          return;
        }

        if (conflict.details?.draftReleases?.length) {
          // Открываем диалог подтверждения.
          setConfirmState({
            trackId,
            trackTitle,
            draftReleases: conflict.details.draftReleases,
          });
          return;
        }
      }
      throw e;
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmForceDelete = async () => {
    if (!confirmState) return;
    setIsDeleting(true);
    try {
      await artistApi.deleteTrack(confirmState.trackId, true);
      removeTrack(confirmState.trackId);
      setConfirmState(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelConfirm = () => setConfirmState(null);
  const dismissBlocked = () => setBlockedMessage(null);

  return {
    deleteTrack,
    confirmForceDelete,
    cancelConfirm,
    dismissBlocked,
    confirmState,
    blockedMessage,
    isDeleting,
  };
}
