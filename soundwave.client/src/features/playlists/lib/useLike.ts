import { useCallback } from "react";

import { playlistApi } from "../api/playlistApi";
import { usePlaylistStore } from "../model/playlistStore";

// Хук лайка трека. Оптимистичный: обновляем UI сразу, откатываем при ошибке.
export function useLike() {
  // Подписываемся именно на likedTrackIds — компонент ре-рендерится
  // при каждом изменении Set (новая ссылка после addLikedTrack / removeLikedTrack).
  const likedTrackIds = usePlaylistStore((s) => s.likedTrackIds);
  const addLikedTrack = usePlaylistStore((s) => s.addLikedTrack);
  const removeLikedTrack = usePlaylistStore((s) => s.removeLikedTrack);

  const toggleLike = useCallback(
    async (trackId: number) => {
      const wasLiked = likedTrackIds.has(trackId);

      // Оптимистично обновляем
      if (wasLiked) {
        removeLikedTrack(trackId);
      } else {
        addLikedTrack(trackId);
      }

      try {
        const res = await playlistApi.toggleLike(trackId);
        // Синхронизируем с реальным ответом сервера
        if (res.data.liked) {
          addLikedTrack(trackId);
        } else {
          removeLikedTrack(trackId);
        }
      } catch {
        // Откат при ошибке
        if (wasLiked) {
          addLikedTrack(trackId);
        } else {
          removeLikedTrack(trackId);
        }
      }
    },
    [likedTrackIds, addLikedTrack, removeLikedTrack],
  );

  return {
    // Читаем напрямую из реактивного Set — не через store.isLiked()
    isLiked: (trackId: number) => likedTrackIds.has(trackId),
    toggleLike,
  };
}
