import { useCallback } from "react";
import { likesApi } from "../api/likesApi";
import { useLikesStore } from "../model/likesStore";

export function useLikePlaylist() {
  const store = useLikesStore();

  const toggleSavePlaylist = useCallback(
    async (playlistId: number) => {
      const wasSaved = store.isPlaylistSaved(playlistId);

      useLikesStore.setState((s) => {
        const ids = new Set(s.savedPlaylistIds);
        wasSaved ? ids.delete(playlistId) : ids.add(playlistId);
        return { savedPlaylistIds: ids };
      });

      try {
        const res = await likesApi.toggleSavePlaylist(playlistId);
        if (res.data.saved) {
          likesApi.getSavedPlaylists().then((r) => store.setSavedPlaylists(r.data));
        } else {
          store.removeSavedPlaylist(playlistId);
        }
      } catch {
        useLikesStore.setState((s) => {
          const ids = new Set(s.savedPlaylistIds);
          wasSaved ? ids.add(playlistId) : ids.delete(playlistId);
          return { savedPlaylistIds: ids };
        });
      }
    },
    [store],
  );

  return {
    isPlaylistSaved: (id: number) => store.isPlaylistSaved(id),
    toggleSavePlaylist,
  };
}
