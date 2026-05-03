import { useCallback } from "react";

import { playlistApi } from "../api/playlistApi";
import { usePlaylistStore } from "../model/playlistStore";

// Хук лайка трека. Оптимистичный: обновляем UI сразу, откатываем при ошибке.
export function useLike() {
  const store = usePlaylistStore();

  const toggleLike = useCallback(
    async (trackId: number) => {
      const wasLiked = store.isLiked(trackId);

      // Оптимистично обновляем
      if (wasLiked) {
        store.removeLikedTrack(trackId);
      } else {
        store.addLikedTrack(trackId);
      }

      try {
        const res = await playlistApi.toggleLike(trackId);
        // Синхронизируем с реальным ответом сервера
        if (res.data.liked) {
          store.addLikedTrack(trackId);
        } else {
          store.removeLikedTrack(trackId);
        }
      } catch {
        // Откат при ошибке
        if (wasLiked) {
          store.addLikedTrack(trackId);
        } else {
          store.removeLikedTrack(trackId);
        }
      }
    },
    [store],
  );

  return {
    isLiked: (trackId: number) => store.isLiked(trackId),
    toggleLike,
  };
}
