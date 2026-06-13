import { useCallback } from "react";
import { likesApi } from "../api/likesApi";
import { useLikesStore } from "../model/likesStore";

export function useLikeRelease() {
  const store = useLikesStore();

  const toggleLikeRelease = useCallback(
    async (releaseId: number) => {
      const wasLiked = store.isReleaseLiked(releaseId);

      // Оптимистично — обновляем только Set (без полного объекта Release)
      useLikesStore.setState((s) => {
        const ids = new Set(s.likedReleaseIds);
        wasLiked ? ids.delete(releaseId) : ids.add(releaseId);
        return { likedReleaseIds: ids };
      });

      try {
        const res = await likesApi.toggleLikeRelease(releaseId);
        // Синхронизируем с сервером
        useLikesStore.setState((s) => {
          const ids = new Set(s.likedReleaseIds);
          res.data.liked ? ids.add(releaseId) : ids.delete(releaseId);
          return { likedReleaseIds: ids };
        });
      } catch {
        // Откат
        useLikesStore.setState((s) => {
          const ids = new Set(s.likedReleaseIds);
          wasLiked ? ids.add(releaseId) : ids.delete(releaseId);
          return { likedReleaseIds: ids };
        });
      }
    },
    [store],
  );

  return {
    isReleaseLiked: (id: number) => store.isReleaseLiked(id),
    toggleLikeRelease,
  };
}
