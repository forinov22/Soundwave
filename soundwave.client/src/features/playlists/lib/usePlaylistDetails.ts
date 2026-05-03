import { useEffect } from "react";

import { useAsync } from "@/shared/hooks/useAsync";

import { playlistApi } from "../api/playlistApi";
import { usePlaylistStore } from "../model/playlistStore";
import type { UpdatePlaylistPayload } from "../types";

// Хук для страницы плейлиста.
export function usePlaylistDetails(playlistId: number) {
  const store = usePlaylistStore();
  const details = store.cache[playlistId] ?? null;

  const {
    execute: fetchDetails,
    isLoading,
    error,
  } = useAsync(async (id: number) => {
    const res = await playlistApi.getById(id);
    store.setPlaylistDetails(res.data);

    // Если это «Любимые треки» — сразу заполняем set лайков
    if (res.data.isLikedSongs) {
      store.setLikedTrackIds(res.data.tracks.map((t) => t.id));
    }
    return res.data;
  });

  useEffect(() => {
    if (!details) {
      fetchDetails(playlistId);
    }
  }, [playlistId]);

  const { execute: updatePlaylist, isLoading: isUpdating } = useAsync(
    async (payload: UpdatePlaylistPayload) => {
      const res = await playlistApi.update(playlistId, payload);
      store.updatePlaylistDetails(res.data);
      return res.data;
    },
  );

  const { execute: addTrack, isLoading: isAddingTrack } = useAsync(
    async (trackId: number) => {
      const res = await playlistApi.addTrack(playlistId, trackId);
      store.updatePlaylistDetails(res.data);
      return res.data;
    },
  );

  const { execute: removeTrack } = useAsync(async (trackId: number) => {
    const res = await playlistApi.removeTrack(playlistId, trackId);
    store.updatePlaylistDetails(res.data);
    return res.data;
  });

  const { execute: deletePlaylist } = useAsync(async () => {
    await playlistApi.delete(playlistId);
    store.removePlaylist(playlistId);
  });

  const { execute: togglePublic } = useAsync(async () => {
    if (!details) return;
    const res = await playlistApi.update(playlistId, {
      isPublic: !details.isPublic,
    });
    store.updatePlaylistDetails(res.data);
  });

  return {
    details,
    isLoading: isLoading && !details,
    error,
    updatePlaylist,
    isUpdating,
    addTrack,
    isAddingTrack,
    removeTrack,
    deletePlaylist,
    togglePublic,
  };
}
