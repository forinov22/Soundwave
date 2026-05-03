import { useEffect } from "react";

import { useAsync } from "@/shared/hooks/useAsync";
import { useAuthStore } from "@/features/auth/model/authStore";

import { playlistApi } from "../api/playlistApi";
import { usePlaylistStore } from "../model/playlistStore";

// Хук для сайдбара: загружает список плейлистов и умеет создавать новый.
export function usePlaylists() {
  const store = usePlaylistStore();
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  const { execute: fetchPlaylists, isLoading } = useAsync(async () => {
    const res = await playlistApi.getMine();
    store.setPlaylists(res.data);

    // Инициализируем set лайков из «Любимых треков»
    const liked = res.data.find((p) => p.isLikedSongs);
    // Треков в summary нет — lиkedTrackIds заполнится при открытии плейлиста
    return res.data;
  });

  // Загружаем при монтировании если авторизованы и список пуст
  useEffect(() => {
    if (isAuthed && store.playlists.length === 0) {
      fetchPlaylists();
    }
  }, [isAuthed]);

  const { execute: createPlaylist, isLoading: isCreating } = useAsync(
    async () => {
      const res = await playlistApi.create();
      store.addPlaylist(res.data);
      return res.data;
    },
  );

  const { execute: deletePlaylist } = useAsync(async (id: number) => {
    await playlistApi.delete(id);
    store.removePlaylist(id);
  });

  return {
    playlists: store.playlists,
    likedSongs: store.playlists.find((p) => p.isLikedSongs) ?? null,
    isLoading,
    createPlaylist,
    isCreating,
    deletePlaylist,
  };
}
