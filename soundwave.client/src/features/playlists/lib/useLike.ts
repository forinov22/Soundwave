import { useCallback } from "react";

import { playlistApi } from "../api/playlistApi";
import { usePlaylistStore } from "../model/playlistStore";

// Хук лайка трека. Оптимистичный: обновляем UI сразу, откатываем при ошибке.
export function useLike() {
  // Подписываемся именно на likedTrackIds — компонент ре-рендерится
  // при каждом изменении Set (новая ссылка после addLikedTrack / removeLikedTrack).
  const likedTrackIds = usePlaylistStore((s) => s.likedTrackIds);
  const playlists = usePlaylistStore((s) => s.playlists);
  const addLikedTrack = usePlaylistStore((s) => s.addLikedTrack);
  const removeLikedTrack = usePlaylistStore((s) => s.removeLikedTrack);
  const setPlaylists = usePlaylistStore((s) => s.setPlaylists);
  const setLikedTrackIds = usePlaylistStore((s) => s.setLikedTrackIds);

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
        await playlistApi.toggleLike(trackId);

        // Если лайкнули первый трек у нового пользователя — бэкенд только что
        // создал плейлист «Любимые треки». Перезагружаем список, чтобы он
        // появился в сайдбаре со счётчиком = 1.
        if (!wasLiked && !playlists.some((p) => p.isLikedSongs)) {
          const res = await playlistApi.getMine();
          setPlaylists(res.data);
          const liked = res.data.find((p) => p.isLikedSongs);
          if (liked) {
            const details = await playlistApi.getById(liked.id);
            setLikedTrackIds(details.data.tracks.map((t) => t.id));
          }
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
    [likedTrackIds, playlists, addLikedTrack, removeLikedTrack, setPlaylists, setLikedTrackIds],
  );

  return {
    // Читаем напрямую из реактивного Set — не через store.isLiked()
    isLiked: (trackId: number) => likedTrackIds.has(trackId),
    toggleLike,
  };
}
